# Umais Ali Portfolio

A client portfolio site for Umais Ali, an SEO Executive. It runs on Node.js with Express, Pug for views, HTMX for light interactivity, Tailwind CSS for styling, and TypeScript on the server.

This is not a static export. Pages render through Express, and the Node runtime handles dynamic routes and the contact form. On Vercel the app runs as a serverless Node function, with static files served from `public/`.

## Features

* Responsive portfolio landing page
* Server-rendered views with Pug
* Project modals via HTMX fragments
* Contact form validation, honeypot field, and Origin/Referer CSRF check
* Outbound email through Resend, including dashboard templates when configured
* Per-IP rate limiting on the contact form
* Vercel Web Analytics and Speed Insights when enabled
* Helmet security headers and a nonce-based Content Security Policy
* Self-hosted HTMX runtime so no third-party script is needed
* Tailwind CSS v4 CLI build
* Tests with Node's built-in test runner and `tsx`

## Tech Stack

* **Runtime:** Node.js 24
* **Framework:** Express 5
* **Templating:** Pug 3
* **Frontend:** HTMX 2, Tailwind CSS 4
* **Language:** TypeScript 6
* **Email:** Resend
* **Hosting:** Vercel

## Project Structure

```text
api/index.ts                  Vercel serverless entrypoint
public/                       Static assets served directly
public/css/main.css           Generated Tailwind CSS bundle (built, gitignored)
public/js/site-main.js        Client-side interaction bundle
public/js/htmx-2.0.4.min.js   Self-hosted HTMX runtime, pinned with SRI
src/server.ts                 Express app and routes
src/contact.ts                Contact form validation and value coercion
src/email.ts                  Resend email sending
src/env.ts                    Environment variable parsing
src/data/                     Site and project content
src/styles/main.css           Tailwind source CSS
src/views/                    Pug layouts, pages, and partials
tests/                        Node test suite
vercel.json                   Vercel routing and build config
```

## Requirements

* Node.js 24.x (see `.nvmrc` if you use a version manager)
* pnpm: enable [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`), then installs follow the `packageManager` field in `package.json` so everyone uses the same pnpm release

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item` if `cp` is not available:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with the values you need for contact email to send.

## Environment Variables

Required for production contact delivery:

```env
RESEND_API_KEY=
CONTACT_FROM=
CONTACT_TO=
CONTACT_TEMPLATE_ID=
```

Recommended on Vercel:

```env
TRUST_PROXY=1
ENABLE_HSTS=true
```

Optional:

```env
CONTACT_REPLY_TO=
CONTACT_RATE_WINDOW_MS=600000
CONTACT_RATE_MAX=5
```

Local defaults:

```env
NODE_ENV=development
PORT=3000
```

Vercel sets `NODE_ENV` for you. You do not set `PORT` for serverless functions.

### Resend Template

When `CONTACT_TEMPLATE_ID` is set, the app sends through a published Resend dashboard template instead of the inline HTML/text fallback.

The template should expose these variables:

```text
name
email
message
subject
ip
userAgent
```

Notes:

* The template must be published, not left as a draft only.
* `subject` is supplied as a variable so the template can use it (`{{ subject }}`) or ignore it. The app no longer sends a `subject` field at the top level when a template is used, so the dashboard's own subject line wins by default.
* `from` is also deferred to the template when one is configured. Set the From address in the Resend dashboard.
* Leave Reply-To empty in the dashboard template, or set it to a fixed address you control. After validation, the app sets `replyTo` from the submitter's address (or from `CONTACT_REPLY_TO` if you set that). Both are sanitized to strip stray newlines before sending.
* Resend caps template variable length at 2,000 characters, which also caps the contact message length.

## Local Development

Start the dev server with CSS watching:

```bash
pnpm dev
```

Default URL: `http://localhost:3000`.

### Before You Push

Build and run locally, then run the full check script:

```bash
pnpm run preview
pnpm run verify
```

`verify` runs TypeScript checks, tests, Biome lint, and a production build in one command.

## Push and CI

1. **Pre-push hook:** `simple-git-hooks` runs on `git push`. It checks that `pnpm-lock.yaml` matches `package.json` (`pnpm install --frozen-lockfile --lockfile-only`). If that passes, it runs `pnpm run typecheck` and `pnpm test`. If the lockfile step fails, run `pnpm install`, commit the lockfile change, and push again.
2. **GitHub Actions:** Pushes to `main` and pull requests against `main` run the Verify workflow: install with a frozen lockfile, then `pnpm run verify`, on Node 24.

## Deployment

Hosting is Vercel. CI and deploy are separate concerns.

* **Preview:** Each pull request gets its own preview URL.
* **Production:** Pushes to `main` go to production.

`vercel.json` wires the app to Vercel. In short:

* `pnpm install --frozen-lockfile` during the build (see `vercel.json`).
* `pnpm run build` writes `public/css/main.css` and compiles TypeScript into `dist/`.
* Static files under `public/` are served as-is.
* Other requests hit `api/index.ts`, which loads the Express app from `src/server.ts`.

### Production Env and Startup Checks

If required mail settings are missing in production (for example `RESEND_API_KEY` or `CONTACT_TO`), the process exits on startup so the problem is obvious instead of the site running without mail.

Set these in Vercel project settings (use your real sender domain in Resend):

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM=Umais Ali <hello@submissions.umaisali.com>
CONTACT_TO=hello@umaisali.com
CONTACT_TEMPLATE_ID=your_published_resend_template_id
TRUST_PROXY=1
ENABLE_HSTS=true
```

## Content Updates

Most copy and structured content lives in:

* `src/data/site.ts`
* `src/data/projects.ts`

Pug partials sit under `src/views/partials/`.

After style or class changes that affect the built CSS, run:

```bash
pnpm build
```

## Security Notes

* `.env` is gitignored. Do not commit secrets.
* Helmet runs with a nonce-based Content Security Policy. `script-src` is `'self'` plus a per-request nonce. No external script CDNs are listed.
* HTMX is served from `/js/htmx-2.0.4.min.js` and pinned to a SHA-384 integrity hash in the layout. To upgrade, replace the file, recompute the hash with `openssl dgst -sha384 -binary <file> | openssl base64 -A`, and update the `integrity` value in `src/views/layout.pug`.
* The contact endpoint is protected by:
  * A honeypot field (`website`). Submissions that fill it get a fake success response so bots cannot tell their hit was rejected.
  * Per-IP rate limiting (defaults: 5 requests per 10 minutes).
  * Stateless CSRF check on `Origin` and `Referer` in production. The check parses the URL and compares origins exactly, so a host like `umaisali.com.attacker.example` cannot pass through a string-prefix match.
  * Server-side validation of name (2 to 80 chars), email (basic shape plus length cap), and message (10 to 2000 chars).
* User-supplied email content is escaped before going into the inline HTML fallback. Header values (`subject`, `replyTo`) are stripped of CR/LF and length-capped to defeat header injection.
* Body parsing is limited to 32kb of `application/x-www-form-urlencoded`.
* Tests stub the mail sender so nothing goes to Resend by accident.
