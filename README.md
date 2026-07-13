# Umais Ali Portfolio

A client portfolio site for Umais Ali, an SEO Executive. It is a highly optimized, modern static site built on Astro, Svelte 5 (islands), and TypeScript, using Tailwind CSS 4 for styling, and Motion for animation.

All content pages are prerendered and served from the edge. The only server side behavior is a single on-demand serverless endpoint for the contact form submissions.

## Features

* Responsive, high performance portfolio landing page
* Fully pre-rendered static routes with Astro layouts, pages, and components
* Progressive enhancement Svelte 5 island for accessible, stateful project dialogs and URL/history synchronization
* Independent static project detail routes for rich SEO indexation
* Contact form validation, honeypot field, and exact Origin/Referer CSRF check
* Outbound email through Resend, including dashboard templates when configured
* Per-IP rate limiting on the form submissions
* Vercel Web Analytics and Speed Insights when deployed
* Edge-native security headers and Content Security Policy configured in `vercel.json`
* Native browser scripts for frictionless theme persistence and sticky layouts
* Tailwind CSS v4 Vite compilation integration
* Fast, lightweight tests with Node's built-in test runner and `tsx`

## Tech Stack

* **Build & SSG:** Astro
* **Client Island:** Svelte 5
* **Interactions & Animation:** Motion
* **CSS & Style Compilation:** Tailwind CSS 4, `@tailwindcss/vite`
* **Language:** TypeScript
* **Email:** Resend
* **Hosting Adapter:** `@astrojs/vercel`

## Project Structure

```text
astro.config.ts               Astro project & integration settings
svelte.config.js              Svelte compilation parameters
vercel.json                   Vercel security headers and config
src/layouts/BaseLayout.astro  Central Astro document wrapper and metadata
src/components/layout/        Reusable head, footer, icon, and logo Astro snippets
src/components/sections/      Individual landing page blocks
src/components/islands/       Svelte client islands (ProjectDialog)
src/pages/                    Astro pre-rendered structural pages and API endpoints
src/pages/api/contact.ts      On-demand serverless contact submission endpoint
src/pages/og-image.png.ts     Static pre-rendered OG image builder (Satori + Resvg)
src/scripts/                  Lightweight typescript client behaviors
src/data/                     Site and project structured data
tests/                        Instant native Node test suite (unit and endpoint checks)
```

## Requirements

* Node.js 24.x (see `.nvmrc`)
* pnpm: pin to `pnpm@11.11.0` via `packageManager` field in `package.json`

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item`:

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

Vercel sets `NODE_ENV` for you.

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
* `subject` is supplied as a variable so the template can use it (`{{ subject }}`).
* `from` is also deferred to the template when one is configured. Set the From address in the Resend dashboard.
* Leave Reply-To empty in the dashboard template. After validation, the app sets `replyTo` from the submitter's address. Both are sanitized to strip stray newlines before sending.
* Resend caps template variable length at 2,000 characters.

## Local Development

Start the Astro dev server:

```bash
pnpm dev
```

Default URL: `http://localhost:4321`.

### Before You Push

Build and run locally, then run the full check verification:

```bash
pnpm run preview
pnpm run verify
```

`verify` runs Astro sync, typecheck (including tests), Node unit & endpoint tests, Biome linting, and Astro production compilation in one go.

## Push and CI

1. **Pre-push hook:** `simple-git-hooks` runs on the push event. It checks lockfile consistency, then runs `pnpm run typecheck` and `pnpm test`.
2. **GitHub Actions:** Verify workflow runs on all pushes or PRs to `main` with Node 24.

## Deployment

Hosting is Vercel. CI and deploy are separate concerns. Astro's Vercel adapter generates edge-ready pre-rendered assets and endpoints automatically.

## Content Updates

Most copy and structured content lives in:

* `src/data/site.ts`
* `src/data/projects.ts`

After editing data or stylesheet classes, run `pnpm run verify` to test.

## Security Notes

* Security headers and a strict Content Security Policy are served directly from the Vercel CDN layer via `vercel.json` for ultimate edge speed.
* The contact endpoint is protected by:
  * A honeypot field (`website`). Submissions that fill it get a fake success response to bot crawlers.
  * Per-IP rate limiting.
  * Stateless CSRF check on `Origin` and `Referer`.
  * Server-side validation.
* User-supplied email content is escaped before going into the inline HTML fallback. Header values are stripped of CR/LF and length-capped.
* Tests stub the mail sender so nothing goes to Resend by accident.
