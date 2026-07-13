process.env.NODE_ENV = 'test'
process.env.RESEND_API_KEY = 're_test_key'
process.env.CONTACT_TO = 'owner@example.com'
process.env.CONTACT_FROM = 'noreply@umaisali.com'

import assert from 'node:assert/strict'
import { test } from 'node:test'

const validValues = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello! This is a well-formed contact submission for the delivery test.',
} as const

test('sendContactEmail - reports delivery when Resend responds successfully', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ id: 'email_123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  try {
    // Import after env + fetch are stubbed so the Resend client picks up the key.
    const { sendContactEmail } = await import('../src/email')
    const result = await sendContactEmail({
      values: { ...validValues },
      ip: '127.0.0.1',
      userAgent: 'node-test',
    })

    assert.equal(result.delivered, true)
    assert.equal(result.id, 'email_123')
    assert.equal(result.skipped, undefined)
    assert.equal(result.error, undefined)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('sendContactEmail - surfaces a typed failure when Resend errors', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: 'validation_error', message: 'Invalid recipient.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    })

  try {
    const { sendContactEmail } = await import('../src/email')
    const result = await sendContactEmail({
      values: { ...validValues },
      ip: '127.0.0.1',
      userAgent: 'node-test',
    })

    assert.equal(result.delivered, false)
    assert.ok(result.error, 'a failure reason should be present')
  } finally {
    globalThis.fetch = originalFetch
  }
})
