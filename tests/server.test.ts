import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { createApp } from '../src/server'
import { projects } from '../src/data/projects'
import { services } from '../src/data/site'

async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createApp({
    sendEmail: async () => ({ delivered: true, id: 'test-email-id' }),
  })
  const server = app.listen(0)
  try {
    await new Promise<void>((resolve) => server.once('listening', () => resolve()))
    const { port } = server.address() as AddressInfo
    return await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

test('GET / renders the home page', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.match(html, /<html/i)
  })
})

test('GET /projects/:id returns the modal fragment for a real project', async () => {
  await withServer(async (base) => {
    const id = projects[0].id
    const res = await fetch(`${base}/projects/${id}`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes(projects[0].title), 'fragment should include project title')
  })
})

test('GET /projects/:id 404s for unknown id', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/projects/9999`)
    assert.equal(res.status, 404)
  })
})

test('GET /projects/:id 404s for non-numeric id', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/projects/not-a-number`)
    assert.equal(res.status, 404)
  })
})

test('GET /services renders the service index', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/services`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.match(html, /SEO services for teams/i)
    assert.ok(html.includes(`/services/${services[0].slug}`), 'index should link to service pages')
  })
})

test('GET /services/:slug renders every service page', async () => {
  await withServer(async (base) => {
    for (const service of services) {
      const res = await fetch(`${base}/services/${service.slug}`)
      assert.equal(res.status, 200)
      const html = await res.text()
      assert.ok(html.includes(service.title), `page should include ${service.title}`)
      assert.ok(html.includes(service.metaDescription), `page should include metadata for ${service.title}`)
    }
  })
})

test('GET /services/:slug 404s for unknown service', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/services/not-a-real-service`)
    assert.equal(res.status, 404)
  })
})

test('POST /contact returns 422 + form fragment on invalid input', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'A', email: 'nope', message: 'short' }).toString(),
    })
    assert.equal(res.status, 422)
    const html = await res.text()
    assert.match(html, /valid email/i)
  })
})

test('POST /contact returns 200 success fragment on valid input', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, this is a perfectly reasonable message.',
      }).toString(),
    })
    assert.equal(res.status, 200)
    const html = await res.text()
    // success fragment copy
    assert.match(html, /Got it/i)
    assert.match(html, /Talk soon/i)
  })
})

test('GET /contact/form returns a fresh contact form fragment', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/contact/form`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.match(html, /id="contact-form"/)
    assert.match(html, /placeholder="Your name"/)
    assert.match(html, /placeholder="you@domain.com"/)
  })
})

test('POST /contact silently 200s on honeypot hit (no error leaked to bot)', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name: 'Bot',
        email: 'not-even-valid',
        message: 'x',
        website: 'http://spam.example',
      }).toString(),
    })
    assert.equal(res.status, 200)
  })
})

test('unknown route renders the 404 page', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/this-does-not-exist`)
    assert.equal(res.status, 404)
    const html = await res.text()
    assert.match(html, /<html/i)
  })
})

test('GET /og-image.png returns a generated PNG with cache headers', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/og-image.png`)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('content-type'), 'image/png')
    assert.match(res.headers.get('cache-control') ?? '', /max-age=/)
    const buf = Buffer.from(await res.arrayBuffer())
    assert.ok(buf.byteLength > 1024, 'PNG payload should be non-trivial')
    // PNG magic bytes
    assert.deepEqual(buf.subarray(0, 8), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  })
})

