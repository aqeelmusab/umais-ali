import type { APIRoute } from 'astro';
import { validateContact } from '../../contact';
import { sendContactEmail } from '../../email';
import { SITE_URL, CONTACT_EMAIL } from '../../data/site';
import { env } from '../../env';

// Disable build-time prerendering for this dynamic POST endpoint.
export const prerender = false;

// Simple in-memory rate limiter for best-effort throttling (e.g., local development).
interface RateLimitInfo {
  count: number;
  resetAt: number;
}
const rateLimiterCache = new Map<string, RateLimitInfo>();

function isThrottled(ip: string): { throttled: boolean; retryAfter: number } {
  const now = Date.now();
  const windowMs = env.CONTACT_RATE_WINDOW_MS;
  const maxRequests = env.CONTACT_RATE_MAX;

  const info = rateLimiterCache.get(ip);
  if (!info || now > info.resetAt) {
    rateLimiterCache.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { throttled: false, retryAfter: 0 };
  }

  if (info.count >= maxRequests) {
    const remainingSeconds = Math.ceil((info.resetAt - now) / 1000);
    return { throttled: true, retryAfter: remainingSeconds };
  }

  info.count++;
  return { throttled: false, retryAfter: 0 };
}

// Helper to check CSRF origin matching
function verifyCsrf(request: Request): boolean {
  if (!import.meta.env.PROD) return true; // Bypass CSRF check in dev/preview if desired, but we check env.
  const csrfEnabled = true; // Enabled in prod
  if (!csrfEnabled) return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const expectedOrigin = new URL(SITE_URL).origin;

  if (origin && origin !== expectedOrigin) {
    console.warn('[contact] CSRF origin mismatch', { origin, expectedOrigin });
    return false;
  }

  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin !== expectedOrigin) {
        console.warn('[contact] CSRF referer mismatch', { referer, expectedOrigin });
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

// Standard HTML pages served as no-JS fallback responses
function renderHtmlPage(title: string, contentHtml: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en" class="bg-background">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | Umais Ali</title>
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body class="font-sans antialiased overflow-x-hidden min-h-screen flex flex-col justify-between" tabindex="-1">
    <header id="site-nav" class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 py-10" aria-label="Primary">
      <a class="group inline-flex items-center gap-2" href="/" aria-label="Umais Ali, home">
        <span class="relative inline-flex items-center justify-center overflow-hidden rounded-md border border-border bg-card transition-colors h-8 w-8">
          <span class="font-serif leading-none text-foreground text-base">UA</span>
        </span>
        <span class="flex flex-col leading-none">
          <span class="font-serif text-foreground text-[0.95rem]">Umais Ali</span>
        </span>
      </a>
      <a href="/" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Back home</a>
    </header>

    <main class="flex-1 flex items-center justify-center px-6 py-20">
      <div class="max-w-xl w-full border border-border rounded-xl bg-card/40 p-8 md:p-12 shadow-md">
        ${contentHtml}
      </div>
    </main>

    <footer class="border-t border-border py-8 text-center text-xs text-muted-foreground">
      <p>&copy; ${new Date().getFullYear()} Umais Ali. All rights reserved.</p>
    </footer>
  </body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Verify exact CORS and CSRF posture
  if (!verifyCsrf(request)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Invalid request origin. Please reload and try again.',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Extract Client IP
  const ip = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // 3. Throttling / Rate-Limiting Check
  const { throttled, retryAfter } = isThrottled(ip);
  if (throttled) {
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          ok: false,
          errors: { message: `Too many requests. Please try again in ${retryAfter} seconds.` },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return renderHtmlPage(
      'Rate Limit Exceeded',
      `<h2 class="font-serif text-3xl text-foreground mb-4">Please slow down.</h2>
       <p class="text-muted-foreground text-sm leading-relaxed mb-6">You've sent too many messages recently. Please wait a bit before trying again.</p>
       <a href="/" class="inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background h-10 px-6 text-sm hover:bg-foreground/90 transition-colors">Back home</a>`
    );
  }

  // 4. Parse content type body
  let body: any = {};
  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Invalid payload.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Conduct form integrity & validation checks
  const result = validateContact(body);

  // 6. Handle silent accept on honeypots
  if (result.honeypot) {
    const fakeName = result.values.name || 'there';
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ ok: true, name: fakeName }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return renderHtmlPage(
      'Message Sent Successfully',
      `<h2 class="font-serif text-3xl text-foreground mb-4">Message sent...</h2>
       <p class="text-muted-foreground text-sm leading-relaxed mb-6">Thanks for reaching out, ${fakeName}! I'll inspect your details and follow up soon.</p>
       <a href="/" class="inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background h-10 px-6 text-sm hover:bg-foreground/90 transition-colors">Back home</a>`
    );
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
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // fallback rendering with retry instructions
    return renderHtmlPage(
      'Validation Error',
      `<h2 class="font-serif text-3xl text-foreground mb-4">Please correct the entries.</h2>
       <ul class="text-destructive text-sm list-disc pl-5 space-y-2 mb-6">
         ${result.errors.name ? `<li>${result.errors.name}</li>` : ''}
         ${result.errors.email ? `<li>${result.errors.email}</li>` : ''}
         ${result.errors.message ? `<li>${result.errors.message}</li>` : ''}
       </ul>
       <a href="/#contact" class="inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background h-10 px-6 text-sm hover:bg-foreground/90 transition-colors">Try again</a>`
    );
  }

  // 7. Fire Email Orchestration
  const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 500);

  const sent = await sendContactEmail({
    values: result.values,
    ip,
    userAgent,
  });

  if (sent.delivered) {
    console.log('[contact] delivered via Resend', { id: sent.id });
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ ok: true, name: result.values.name }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return renderHtmlPage(
      'Message Received',
      `<h2 class="font-serif text-3xl text-foreground mb-4">Got it. <span class="serif-italic text-muted-foreground">Talk soon.</span></h2>
       <p class="text-muted-foreground text-sm leading-relaxed mb-6">Thanks for the note, ${result.values.name}. I read every message myself, so the reply will come from me. Usually within a day.</p>
       <a href="/" class="inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background h-10 px-6 text-sm hover:bg-foreground/90 transition-colors">Back home</a>`
    );
  }

  // Handle email sending failure
  console.error('[contact] Resend delivery failure', { error: sent.error });
  if (request.headers.get('accept')?.includes('application/json')) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Upstream dispatcher error',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return renderHtmlPage(
    'Delivery Failure',
    `<h2 class="font-serif text-3xl text-foreground mb-4">Could not send via form.</h2>
     <p class="text-muted-foreground text-sm leading-relaxed mb-6">Something went wrong on our side. Please connect by emailing me directly at <a class="font-medium text-foreground underline hover:text-primary transition-colors" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
     <a href="/" class="inline-flex items-center justify-center rounded-full bg-foreground font-medium text-background h-10 px-6 text-sm hover:bg-foreground/90 transition-colors">Back home</a>`
  );
};
