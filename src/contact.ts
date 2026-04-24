// Pure helpers for the contact form. Exported separately so they can be
// unit-tested without booting the Express app.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  if (!EMAIL_RE.test(values.email) || values.email.length > 200) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.message.length < 10 || values.message.length > 4000) {
    errors.message = 'Please write a message between 10 and 4000 characters.'
  }

  return {
    honeypot,
    values,
    errors,
    ok: !honeypot && Object.keys(errors).length === 0,
  }
}
