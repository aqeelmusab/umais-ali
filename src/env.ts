import 'dotenv/config'

function str(name: string, fallback?: string): string {
  const v = process.env[name]
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback
    return ''
  }
  return v
}

function int(name: string, fallback: number): number {
  const v = process.env[name]
  if (v === undefined || v === '') return fallback
  const n = Number(v)
  if (!Number.isFinite(n)) {
    console.warn(`[env] ${name}=${JSON.stringify(v)} is not numeric — falling back to ${fallback}`)
    return fallback
  }
  return n
}

function bool(name: string, fallback: boolean): boolean {
  const v = process.env[name]
  if (v === undefined || v === '') return fallback
  return /^(1|true|yes|on)$/i.test(v)
}

export const env = {
  NODE_ENV: str('NODE_ENV', 'development'),
  PORT: int('PORT', 3000),

  // Vercel forwards client IP metadata through proxy headers.
  // Set to "1" or a number of hops so rate limiting sees the real client IP.
  TRUST_PROXY: str('TRUST_PROXY', '1'),

  // Resend
  RESEND_API_KEY: str('RESEND_API_KEY'),
  // Verified sender on Resend (e.g. "Umais Ali <hello@umaisali.com>")
  CONTACT_FROM: str('CONTACT_FROM', 'Umais Ali <onboarding@resend.dev>'),
  // Where contact-form messages get delivered.
  CONTACT_TO: str('CONTACT_TO'),
  // Optional published Resend template id or alias for contact-form emails.
  CONTACT_TEMPLATE_ID: str('CONTACT_TEMPLATE_ID'),
  // Optional reply-to override; defaults to the submitter's email.
  CONTACT_REPLY_TO: str('CONTACT_REPLY_TO'),

  // Rate limiter on POST /contact
  CONTACT_RATE_WINDOW_MS: int('CONTACT_RATE_WINDOW_MS', 10 * 60 * 1000), // 10 min
  CONTACT_RATE_MAX: int('CONTACT_RATE_MAX', 5),

  // Optional: turn off helmet HSTS locally over http.
  ENABLE_HSTS: bool('ENABLE_HSTS', true),
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
