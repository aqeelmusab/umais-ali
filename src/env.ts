import 'dotenv/config'

function parseStr(value: string | undefined, fallback?: string): string {
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback
    return ''
  }
  return value
}

function parseIntVal(name: string, value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n)) {
    console.warn(
      `[env] ${name}=${JSON.stringify(value)} is not numeric, falling back to ${fallback}`,
    )
    return fallback
  }
  return n
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  return /^(1|true|yes|on)$/i.test(value)
}

export const env = {
  NODE_ENV: parseStr(process.env.NODE_ENV, 'development'),
  PORT: parseIntVal('PORT', process.env.PORT, 3000),

  // Vercel forwards client IP metadata through proxy headers.
  // Set to "1" or a number of hops so rate limiting sees the real client IP.
  TRUST_PROXY: parseStr(process.env.TRUST_PROXY, '1'),

  // Resend
  RESEND_API_KEY: parseStr(process.env.RESEND_API_KEY),
  // Verified sender on Resend (e.g. "Umais Ali <hello@umaisali.com>")
  CONTACT_FROM: parseStr(process.env.CONTACT_FROM, 'Umais Ali <onboarding@resend.dev>'),
  // Where contact-form messages get delivered.
  CONTACT_TO: parseStr(process.env.CONTACT_TO),
  // Optional published Resend template id or alias for contact-form emails.
  CONTACT_TEMPLATE_ID: parseStr(process.env.CONTACT_TEMPLATE_ID),
  // Optional reply-to override; defaults to the submitter's email.
  CONTACT_REPLY_TO: parseStr(process.env.CONTACT_REPLY_TO),

  // Rate limiter on POST /contact
  CONTACT_RATE_WINDOW_MS: parseIntVal(
    'CONTACT_RATE_WINDOW_MS',
    process.env.CONTACT_RATE_WINDOW_MS,
    10 * 60 * 1000,
  ), // 10 min
  CONTACT_RATE_MAX: parseIntVal('CONTACT_RATE_MAX', process.env.CONTACT_RATE_MAX, 5),

  // Optional: turn off helmet HSTS locally over http.
  ENABLE_HSTS: parseBool(process.env.ENABLE_HSTS, true),
} as const

export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

export function assertProductionEnv(): void {
  if (!isProduction) return
  const missing: string[] = []
  if (!env.RESEND_API_KEY) missing.push('RESEND_API_KEY')
  if (!env.CONTACT_TO) missing.push('CONTACT_TO')
  if (!env.CONTACT_FROM || env.CONTACT_FROM.includes('onboarding@resend.dev'))
    missing.push('CONTACT_FROM')
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required production env vars: ${missing.join(', ')}. Application cannot start without critical integrations.`,
    )
  }
}
