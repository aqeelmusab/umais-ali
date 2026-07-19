import type { APIRoute } from 'astro'
import { escapeHtml, validateContact } from '../../contact'
import { CONTACT_EMAIL, SITE_URL } from '../../data/site'
import { sendContactEmail } from '../../email'
import { env } from '../../env'

// Disable build-time prerendering for this dynamic POST endpoint.
export const prerender = false

// Simple in-memory rate limiter for best-effort throttling (e.g., local development).
interface RateLimitInfo {
  count: number
  resetAt: number
}
const rateLimiterCache = new Map<string, RateLimitInfo>()
const RATE_LIMIT_CACHE_MAX_ENTRIES = 1000
const RATE_LIMIT_PRUNE_INTERVAL_MS = 60 * 1000
let rateLimitLastPrunedAt = 0

function pruneRateLimiterCache(now: number): void {
  if (
    now - rateLimitLastPrunedAt < RATE_LIMIT_PRUNE_INTERVAL_MS &&
    rateLimiterCache.size < RATE_LIMIT_CACHE_MAX_ENTRIES
  ) {
    return
  }

  rateLimitLastPrunedAt = now
  for (const [ip, info] of rateLimiterCache) {
    if (now > info.resetAt) {
      rateLimiterCache.delete(ip)
    }
  }

  while (rateLimiterCache.size >= RATE_LIMIT_CACHE_MAX_ENTRIES) {
    const oldestIp = rateLimiterCache.keys().next().value
    if (oldestIp === undefined) break
    rateLimiterCache.delete(oldestIp)
  }
}

function isThrottled(ip: string): { throttled: boolean; retryAfter: number } {
  const now = Date.now()
  pruneRateLimiterCache(now)

  const windowMs = env.CONTACT_RATE_WINDOW_MS
  const maxRequests = env.CONTACT_RATE_MAX

  const info = rateLimiterCache.get(ip)
  if (!info || now > info.resetAt) {
    rateLimiterCache.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { throttled: false, retryAfter: 0 }
  }

  if (info.count >= maxRequests) {
    const remainingSeconds = Math.ceil((info.resetAt - now) / 1000)
    return { throttled: true, retryAfter: remainingSeconds }
  }

  info.count++
  return { throttled: false, retryAfter: 0 }
}

// Helper to check CSRF origin matching
function verifyCsrf(request: Request): boolean {
  const isProdOrTest = import.meta.env
    ? import.meta.env.PROD
    : env.NODE_ENV === 'production' || env.NODE_ENV === 'test'
  if (!isProdOrTest) return true // Bypass CSRF check in dev/preview; enforced in prod/test.

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const expectedOrigin = new URL(SITE_URL).origin

  if (origin && origin !== expectedOrigin) {
    console.warn('[contact] CSRF origin mismatch', { origin, expectedOrigin })
    return false
  }

  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin
      if (refererOrigin !== expectedOrigin) {
        console.warn('[contact] CSRF referer mismatch', { referer, expectedOrigin })
        return false
      }
    } catch {
      return false
    }
  }

  return true
}

// Standard HTML pages served as no-JS fallback responses
// Minimal, self-contained styling for this endpoint's no-JS/no-fetch fallback
// pages. These pages are hand-rolled HTML (not run through Astro/Tailwind), so
// they cannot rely on the hashed, build-generated stylesheet the rest of the
// site uses. Keeping the rules inline guarantees they always render correctly,
// with no dependency on any generated or vendored asset existing on disk.
const FALLBACK_STYLES = `
  :root { --surface: #fdfcfa; --ink: #211f1a; --surface-raised: #ffffff; --ink-muted: #6b6659; --line: #e6e2d8; --brand: #a8791f; --danger: #b3311f; }
  @media (prefers-color-scheme: dark) {
    :root { --surface: #221f19; --ink: #fbf8f1; --surface-raised: #29261f; --ink-muted: #a9a397; --line: #3b372c; --brand: #ecc878; --danger: #e5766a; }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { background: var(--surface); color: var(--ink); font-family: "Geist", ui-sans-serif, system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
  .font-serif { font-family: "Instrument Serif", ui-serif, Georgia, serif; }
  .serif-italic { font-style: italic; }
  header { display: flex; align-items: center; justify-content: space-between; max-width: 72rem; width: 100%; margin: 0 auto; padding: 2.5rem 1.5rem; }
  header a { color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
  .logo-mark { display: inline-flex; align-items: center; justify-content: center; height: 2rem; width: 2rem; border-radius: 0.5rem; border: 1px solid var(--line); background: var(--surface-raised); }
  header nav a, header > a:last-child { font-size: 0.875rem; font-weight: 500; color: var(--ink-muted); }
  header nav a:hover, header > a:last-child:hover { color: var(--ink); }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 5rem 1.5rem; }
  main .card { max-width: 36rem; width: 100%; border: 1px solid var(--line); border-radius: 0.75rem; background: var(--surface-raised); padding: 2rem; box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.15); }
  main h2 { font-size: 1.875rem; margin: 0 0 1rem; color: var(--ink); }
  main p { color: var(--ink-muted); font-size: 0.875rem; line-height: 1.6; margin: 0 0 1.5rem; }
  main a.button { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--ink); color: var(--surface); height: 2.5rem; padding: 0 1.5rem; font-size: 0.875rem; font-weight: 500; text-decoration: none; }
  main a.inline-link { color: var(--ink); font-weight: 500; text-decoration: underline; }
  main a.inline-link:hover { color: var(--brand); }
  main ul { color: var(--danger); font-size: 0.875rem; padding-left: 1.25rem; margin: 0 0 1.5rem; }
  main ul li + li { margin-top: 0.5rem; }
  footer { border-top: 1px solid var(--line); padding: 2rem 1.5rem; text-align: center; font-size: 0.75rem; color: var(--ink-muted); }
`

function renderHtmlPage(title: string, contentHtml: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | Umais Ali</title>
    <style>${FALLBACK_STYLES}</style>
    <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body tabindex="-1">
    <header id="site-nav" aria-label="Primary">
      <a href="/" aria-label="Umais Ali, home">
        <span class="logo-mark">
          <span class="font-serif">UA</span>
        </span>
        <span class="font-serif">Umais Ali</span>
      </a>
      <a href="/">Back home</a>
    </header>

    <main>
      <div class="card">
        ${contentHtml}
      </div>
    </main>

    <footer>
      <p>&copy; ${new Date().getFullYear()} Umais Ali. All rights reserved.</p>
    </footer>
  </body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Verify exact CORS and CSRF posture
  if (!verifyCsrf(request)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Invalid request origin. Please reload and try again.',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // 2. Extract Client IP
  let rawIp =
    clientAddress ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  if (rawIp.includes(',')) {
    rawIp = rawIp.split(',')[0]?.trim() || 'unknown'
  }
  const ip = rawIp

  // 3. Throttling / Rate-Limiting Check
  const { throttled, retryAfter } = isThrottled(ip)
  if (throttled) {
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          ok: false,
          errors: { message: `Too many requests. Please try again in ${retryAfter} seconds.` },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return renderHtmlPage(
      'Rate Limit Exceeded',
      `<h2 class="font-serif">Please slow down.</h2>
       <p>You've sent too many messages recently. Please wait a bit before trying again.</p>
       <a href="/" class="button">Back home</a>`,
    )
  }

  // 4. Parse content type body
  let body: unknown = {}
  const contentType = request.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const text = await request.text()
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params.entries())
    }
  } catch (err) {
    console.warn('[contact] failed to parse request body', {
      contentType,
      error: err instanceof Error ? err.message : String(err),
    })
    return new Response(JSON.stringify({ ok: false, message: 'Invalid payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 5. Conduct form integrity & validation checks
  const result = validateContact(body)

  // 6. Handle silent accept on honeypots
  if (result.honeypot) {
    const fakeName = result.values.name || 'there'
    const safeFakeName = escapeHtml(fakeName)
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ ok: true, name: fakeName }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return renderHtmlPage(
      'Message Sent Successfully',
      `<h2 class="font-serif">Message sent...</h2>
       <p>Thanks for reaching out, ${safeFakeName}! I'll inspect your details and follow up soon.</p>
       <a href="/" class="button">Back home</a>`,
    )
  }

  if (!result.ok) {
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          ok: false,
          errors: result.errors,
          values: result.values,
          message: 'Validation failed.',
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // fallback rendering with retry instructions
    return renderHtmlPage(
      'Validation Error',
      `<h2 class="font-serif">Please correct the entries.</h2>
       <ul>
         ${result.errors.name ? `<li>${result.errors.name}</li>` : ''}
         ${result.errors.email ? `<li>${result.errors.email}</li>` : ''}
         ${result.errors.message ? `<li>${result.errors.message}</li>` : ''}
       </ul>
       <a href="/#contact" class="button">Try again</a>`,
    )
  }

  // 7. Fire Email Orchestration
  const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 500)

  const sent = await sendContactEmail({
    values: result.values,
    ip,
    userAgent,
  })

  if (sent.delivered || sent.skipped) {
    if (sent.delivered) {
      console.log('[contact] delivered via Resend', { id: sent.id })
    } else {
      // Resend isn't configured (e.g. local/CI without secrets). Treat the
      // submission as accepted since it passed validation; we just couldn't
      // dispatch the notification email.
      console.log('[contact] email skipped', { reason: sent.skipped })
    }
    const safeName = escapeHtml(result.values.name)
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ ok: true, name: result.values.name }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return renderHtmlPage(
      'Message Received',
      `<h2 class="font-serif">Got it. <span class="serif-italic">Talk soon.</span></h2>
       <p>Thanks for the note, ${safeName}. I read every message myself, so the reply will come from me. Usually within a day.</p>
       <a href="/" class="button">Back home</a>`,
    )
  }

  // Handle email sending failure
  console.error('[contact] Resend delivery failure', { error: sent.error })
  if (request.headers.get('accept')?.includes('application/json')) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Upstream dispatcher error',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return renderHtmlPage(
    'Delivery Failure',
    `<h2 class="font-serif">Could not send via form.</h2>
     <p>Something went wrong on our side. Please connect by emailing me directly at <a class="inline-link" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
     <a href="/" class="button">Back home</a>`,
  )
}
