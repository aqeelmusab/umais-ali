process.env.NODE_ENV = 'test'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getOgImage } from '../src/og-image'
import { POST } from '../src/pages/api/contact'

// Create a helper to quickly invoke the contact API endpoint
async function callContactApi(
  body: string,
  headers: Record<string, string> = {},
  clientAddress = '127.0.0.1',
): Promise<Response> {
  const request = new Request('https://umaisali.com/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...headers,
    },
    body,
  })

  return await POST({
    request,
    clientAddress,
    params: {},
    // biome-ignore lint/suspicious/noExplicitAny: test mocking
    generator: {} as any,
    props: {},
    redirect: () => new Response(null, { status: 302 }),
    // biome-ignore lint/suspicious/noExplicitAny: test mocking
    cookies: {} as any,
    locals: {},
    site: new URL('https://umaisali.com'),
    url: new URL('https://umaisali.com/api/contact'),
    // biome-ignore lint/suspicious/noExplicitAny: test mocking
  } as any)
}

test('POST /api/contact - accepts valid form body', async () => {
  const body = new URLSearchParams({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello! This is a perfectly fine and well-formed contact submission.',
  }).toString()

  const res = await callContactApi(body)
  assert.equal(res.status, 200)
  const data = await res.json()
  assert.equal(data.ok, true)
  assert.equal(data.name, 'Jane Doe')
})

test('POST /api/contact - rejects invalid submission with 422', async () => {
  const body = new URLSearchParams({
    name: 'A', // too short
    email: 'not-at-sign',
    message: 'short',
  }).toString()

  const res = await callContactApi(body)
  assert.equal(res.status, 422)
  const data = await res.json()
  assert.equal(data.ok, false)
  assert.ok(data.errors.name)
  assert.ok(data.errors.email)
  assert.ok(data.errors.message)
})

test('POST /api/contact - silent 200 on honeypot', async () => {
  const body = new URLSearchParams({
    name: 'Botty',
    email: 'bot@spam.com',
    message: 'short website check',
    website: 'http://spam.example',
  }).toString()

  const res = await callContactApi(body)
  assert.equal(res.status, 200)
  const data = await res.json()
  assert.equal(data.ok, true)
})

test('POST /api/contact - HSTS / CSRF rejection on mismatch', async () => {
  const body = new URLSearchParams({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hi there! Just checking CSRF logic.',
  }).toString()

  // Mismatched origin triggers CSRF block (returns 403)
  const res = await callContactApi(body, {
    Origin: 'https://evil.example.com',
  })
  assert.equal(res.status, 403)
  const data = await res.json()
  assert.equal(data.ok, false)
})

test('POST /api/contact - fails on prefix origin validation (prefix hijack filter)', async () => {
  const body = new URLSearchParams({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hi there! Just checking CSRF prefix attack.',
  }).toString()

  const res = await callContactApi(body, {
    Origin: 'https://umaisali.com.evil.example.com',
  })
  assert.equal(res.status, 403)
})

test('GET /og-image.png - renders binary PNG successfully', async () => {
  const png = await getOgImage()
  assert.ok(png.byteLength > 1024, 'PNG size should be non-trivial')
  assert.deepEqual(
    png.subarray(0, 8),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  )
})
