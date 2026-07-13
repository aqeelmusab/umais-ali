import { Resend } from 'resend'
import { type ContactValues, escapeHtml } from './contact'
import { env } from './env'

let client: Resend | null = null
function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null
  if (!client) client = new Resend(env.RESEND_API_KEY)
  return client
}

// Strip CR/LF from header-bound values to defeat header injection.
function sanitizeHeaderValue(s: string): string {
  return s
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 250)
}

export interface SendContactArgs {
  values: ContactValues
  ip?: string | undefined
  userAgent?: string | undefined
}

export interface SendContactResult {
  delivered: boolean
  skipped?: 'no-api-key' | 'no-recipient'
  id?: string
  error?: string
}

export async function sendContactEmail(args: SendContactArgs): Promise<SendContactResult> {
  const resend = getClient()
  if (!resend) return { delivered: false, skipped: 'no-api-key' }
  if (!env.CONTACT_TO) return { delivered: false, skipped: 'no-recipient' }

  const { values, ip, userAgent } = args
  const safeName = sanitizeHeaderValue(values.name)
  const safeEmail = sanitizeHeaderValue(values.email)
  const subject = `New contact form message from ${safeName}`
  // CONTACT_REPLY_TO is operator-controlled but still goes into a header, so
  // sanitize defensively in case a stray newline in env config tries to smuggle
  // extra headers.
  const replyTo = env.CONTACT_REPLY_TO ? sanitizeHeaderValue(env.CONTACT_REPLY_TO) : safeEmail

  const text = `Name: ${values.name}\nEmail: ${values.email}\n${ip ? `IP: ${ip}\n` : ''}${userAgent ? `User-Agent: ${userAgent}\n` : ''}\n${values.message}\n`

  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.5"><p><strong>Name:</strong> ${escapeHtml(values.name)}</p><p><strong>Email:</strong> ${escapeHtml(values.email)}</p>${ip ? `<p><strong>IP:</strong> ${escapeHtml(ip)}</p>` : ''}${userAgent ? `<p><strong>User-Agent:</strong> ${escapeHtml(userAgent)}</p>` : ''}<hr/><p style="white-space:pre-wrap">${escapeHtml(values.message)}</p></div>`

  try {
    const { data, error } = env.CONTACT_TEMPLATE_ID
      ? // When a template is configured, defer subject/from to whatever the
        // template defines. We expose our generated subject as a `{{ subject }}`
        // variable so authors can opt in without us silently overriding it.
        await resend.emails.send({
          to: env.CONTACT_TO,
          replyTo,
          template: {
            id: env.CONTACT_TEMPLATE_ID,
            variables: {
              name: values.name,
              email: values.email,
              message: values.message,
              subject,
              ip: ip ?? '',
              userAgent: userAgent ?? '',
            },
          },
        })
      : await resend.emails.send({
          from: env.CONTACT_FROM,
          to: env.CONTACT_TO,
          subject,
          text,
          html,
          replyTo,
        })
    if (error) {
      return { delivered: false, error: error.message ?? String(error) }
    }
    return { delivered: true, id: data?.id }
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : String(err) }
  }
}
