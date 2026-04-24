import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { createApp } from '../src/server'
import { projects } from '../src/data/projects'

async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createApp()
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
