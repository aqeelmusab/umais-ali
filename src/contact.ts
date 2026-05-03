// Pure helpers for the contact form. Exported separately so they can be
// unit-tested without booting the Express app.

const EMAIL_MAX = 200

/** Pragmatic validation — not full RFC 5322, but rejects common typos and abuse patterns. */
export function isValidEmail(email: string): boolean {
  if (email.length < 5 || email.length > EMAIL_MAX) return false
  if (/\s/.test(email)) return false
  const at = email.indexOf('@')
  if (at <= 0 || at !== email.lastIndexOf('@')) return false
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (!local || !domain) return false
  if (local.includes('..') || domain.includes('..')) return false
  if (local.startsWith('.') || local.endsWith('.')) return false
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-')) return false
  if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) return false
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false
  const labels = domain.split('.')
  if (labels.length < 2) return false
  const tld = labels[labels.length - 1]
  if (tld.length < 2) return false
  for (const label of labels) {
    if (!label || label.length > 63) return false
    if (label.startsWith('-') || label.endsWith('-')) return false
    if (!/^[a-zA-Z0-9-]+$/.test(label)) return false
  }
  return true
}

export interface ContactBody {
  name?: string
  email?: string
  message?: string
  // honeypot — bots typically fill all fields
  website?: string
}

export interface ContactValues {
  name: string
  email: string
  message: string
}

export interface ContactErrors {
  name?: string
  email?: string
  message?: string
}

export interface ContactResult {
  honeypot: boolean
  values: ContactValues
  errors: ContactErrors
  ok: boolean
}

export function validateContact(body: ContactBody | undefined | null): ContactResult {
  const b = body ?? {}
  const values: ContactValues = {
    name: (b.name ?? '').toString().trim(),
    email: (b.email ?? '').toString().trim(),
    message: (b.message ?? '').toString().trim(),
  }
  const honeypot = (b.website ?? '').toString().trim().length > 0

  const errors: ContactErrors = {}
  if (values.name.length < 2 || values.name.length > 80) {
    errors.name = 'Please enter your name (2 to 80 characters).'
  }
  if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.message.length < 10 || values.message.length > 2000) {
    errors.message = 'Please write a message between 10 and 2000 characters.'
  }

  return {
    honeypot,
    values,
    errors,
    ok: !honeypot && Object.keys(errors).length === 0,
  }
}
