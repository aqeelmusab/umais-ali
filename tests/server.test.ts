import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { createApp, type CreateAppOptions } from '../src/server'
import { projects } from '../src/data/projects'
import { services } from '../src/data/site'

async function withServer<T>(fn: (baseUrl: string) => Promise<T>, options: CreateAppOptions = {}): Promise<T> {
  const app = createApp({
    sendEmail: async () => ({ delivered: true, id: 'test-email-id' }),
    ...options,
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
    assert.match(html, /data-modal-close/)
    assert.doesNotMatch(html, /data-modal-backdrop/)
  })
})

test('GET / includes complete SEO and social metadata', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.match(html, /<title>Umais Ali \| SEO that actually moves the needle<\/title>/)
    assert.match(html, /<meta name="description"/)
    assert.match(html, /<meta name="robots" content="index, follow">/)
    assert.match(html, /<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">/)
    assert.match(html, /<link rel="canonical" href="https:\/\/umaisali.com\/">/)
    assert.match(html, /<meta property="og:image:width" content="1200">/)
    assert.match(html, /<meta property="og:image:height" content="630">/)
    assert.match(html, /<meta property="og:image:alt" content="Umais Ali - SEO that actually moves the needle">/)
    assert.match(html, /<meta name="twitter:site" content="@umaisali">/)
    assert.match(html, /<meta name="twitter:image:alt" content="Umais Ali - SEO that actually moves the needle">/)
  })
})

test('GET / includes Vercel Analytics and Speed Insights scripts when enabled', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes('<script src="/_vercel/insights/script.js" defer></script>'))
    assert.ok(html.includes('<script src="/_vercel/speed-insights/script.js" defer></script>'))
  }, { enableVercelInsights: true })
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
    const html = await res.text()
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/)
    assert.doesNotMatch(html, /<link rel="canonical"/)
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
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/)
    assert.doesNotMatch(html, /<link rel="canonical"/)
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

