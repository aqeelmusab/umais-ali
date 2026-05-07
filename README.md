# Umais Ali Portfolio

Client portfolio site for Umais Ali, an SEO Executive. The app is built with Node.js, Express, Pug, HTMX, Tailwind CSS, and TypeScript.

This is not a static-only export. The site renders through an Express app and uses a Node runtime for dynamic routes and the contact form. On Vercel, it runs as a serverless Node function with static assets served from `public/`.

## Features

- Responsive portfolio landing page
- Pug server-rendered views
- HTMX project modal fragments
- Contact form validation and honeypot spam trap
- Resend email delivery with optional Resend dashboard template support
- Per-IP contact form rate limiting
- Vercel Web Analytics and Speed Insights
- Helmet security headers with nonce-based Content Security Policy
- Tailwind CSS v4 build pipeline
- Node test suite using `node:test` and `tsx`

## Tech Stack

- Node.js 24
- Express 5
- Pug 3
- HTMX 2
- Tailwind CSS 4
- TypeScript 6
- Resend
- Vercel serverless functions

## Project Structure

```text
api/index.ts              Vercel serverless entrypoint
public/                   Static assets served directly
public/css/main.css       Generated Tailwind CSS bundle
public/js/site-main.js    Client-side interaction bundle
src/server.ts             Express app and routes
src/contact.ts            Contact form validation
src/email.ts              Resend email sending
src/env.ts                Environment variable parsing
src/data/                 Site and project content
src/styles/main.css       Tailwind source CSS
src/views/                Pug layouts, pages, and partials
tests/                    Node test suite
vercel.json               Vercel routing and build config
```

## Requirements

- Node.js 24.x
- [pnpm](https://pnpm.io/installation) (Corepack: `corepack enable` then the version in `package.json` `packageManager` is used automatically)

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local env file:

```bash
cp .env.example .env
```

On Windows PowerShell, if `cp` is unavailable:

```powershell
Copy-Item .env.example .env
```

Then fill in `.env` with the values needed for contact-form email delivery.

## Environment Variables

Required for production contact-form delivery:

```env
RESEND_API_KEY=
CONTACT_FROM=
CONTACT_TO=
CONTACT_TEMPLATE_ID=
```

Recommended for Vercel:

```env
TRUST_PROXY=1
ENABLE_HSTS=true
```

Optional settings:

```env
CONTACT_REPLY_TO=
CONTACT_RATE_WINDOW_MS=600000
CONTACT_RATE_MAX=5
```

Local-only defaults:

```env
NODE_ENV=development
PORT=3000
```

Vercel sets `NODE_ENV` automatically, and serverless functions do not need a custom `PORT`.

### Resend Template

The app can send contact emails with a published Resend dashboard template when `CONTACT_TEMPLATE_ID` is set.

The template should define these variables:

```text
name
email
message
ip
userAgent
```

Important notes:

- The Resend template must be published, not only saved as a draft.
- Leave the dashboard template Reply-To empty or set it to a fixed email.
- The app sets dynamic `replyTo` from the submitter email after validation.
- Resend template variables have a 2,000 character limit, so the contact message limit is also 2,000 characters.

## Local Development Flow

Run the development server with CSS watching:

```bash
pnpm dev
```

The app defaults to `http://localhost:3000`.

### Local Validation and Preview

Before pushing code, you can run the local `preview` and `verify` scripts to ensure everything is correct:

```bash
pnpm run preview
pnpm run verify
```

The `verify` script runs the full quality gate: typechecking, testing, linting (Biome), and building the app.

## Push and PR Validation

This repository enforces a disciplined Git and CI workflow:

1. **Local Pre-push Hook**: A git hook (managed by `simple-git-hooks`) automatically runs before `git push`. It performs a fast check (`pnpm install --frozen-lockfile --lockfile-only`) to block the push if your `pnpm-lock.yaml` is out of sync with `package.json`. If it fails, run `pnpm install` and commit the changes before pushing.
2. **GitHub Actions pipeline**: Every push to `main` and every Pull Request triggers the `Verify` workflow. This pipeline runs the full `pnpm run verify` gate on Node 24.

## Deployment Flow

The deployment model is **host-driven** via Vercel, kept separate from the CI pipeline.

- **Preview Environments**: Vercel automatically deploys every Pull Request to a unique preview URL.
- **Production**: Vercel automatically deploys pushes to the `main` branch to production.

The app is configured for Vercel in `vercel.json`. Deployment behavior:

- `pnpm install --frozen-lockfile` installs dependencies (configured in `vercel.json`).
- `pnpm run build` generates `public/css/main.css` and compiles TypeScript to `dist/`.
- Vercel serves existing static files first.
- All remaining routes go to `api/index.ts`, which loads the Express app from `src/server.ts`.

### Critical Integrations
The application is designed to **fail loudly** in production rather than silently succeeding if critical integrations are missing. During startup, if required environment variables (like `RESEND_API_KEY` and `CONTACT_TO`) are missing, the server will throw an error and crash.

Add these variables in Vercel Project Settings:

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM=Umais Ali <hello@submissions.umaisali.com>
CONTACT_TO=hello@umaisali.com
CONTACT_TEMPLATE_ID=your_published_resend_template_id
TRUST_PROXY=1
ENABLE_HSTS=true
```

Use the actual verified sender domain configured in Resend.

## Content Updates

Most page copy and structured content lives in:

- `src/data/site.ts`
- `src/data/projects.ts`

Pug view partials live in `src/views/partials/`.

After changing styles or Pug class names, run:

```bash
pnpm build
```

## Security Notes

- `.env` is ignored and should never be committed.
- Helmet is enabled with a nonce-based Content Security Policy.
- Contact form requests are rate limited.
- User-submitted email content is escaped before inline HTML email fallback rendering.
- Tests use a fake email sender to avoid accidental live email delivery.
