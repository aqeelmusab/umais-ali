# Umais Ali Portfolio

A client portfolio website for Umais Ali, an SEO Executive. The application is built with Node.js, Express, Pug, HTMX, Tailwind CSS, and TypeScript.

This project is not a static export. The site renders via an Express application and uses a Node runtime for dynamic routes and the contact form. On Vercel, it runs as a serverless Node function with static assets served from the `public/` directory.

## Features

* Responsive portfolio landing page
* Server-rendered views using Pug
* Project modal fragments powered by HTMX
* Contact form validation with a honeypot spam trap
* Email delivery via Resend with support for dashboard templates
* Per-IP contact form rate limiting
* Vercel Web Analytics and Speed Insights integration
* Helmet security headers and nonce-based Content Security Policy
* Tailwind CSS v4 build pipeline
* Node test suite utilizing `node:test` and `tsx`

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

* Node.js 24.x
* [pnpm](https://pnpm.io/installation) (Enable via Corepack: `corepack enable`. The version specified in `package.json` will be used automatically)

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item` if `cp` is unavailable:

```powershell
Copy-Item .env.example .env
```

Fill in `.env` with the values required for contact form email delivery.

## Environment Variables

Required for production contact form delivery:

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

Local development defaults:

```env
NODE_ENV=development
PORT=3000
```

Vercel sets `NODE_ENV` automatically, and serverless functions do not require a custom `PORT`.

### Resend Template

The application can send contact emails using a published Resend dashboard template when `CONTACT_TEMPLATE_ID` is set.

The template should define the following variables:

```text
name
email
message
ip
userAgent
```

Important notes:

* The Resend template must be published, not just saved as a draft.
* Leave the dashboard template Reply-To empty or set it to a fixed email address.
* The application sets a dynamic `replyTo` address from the submitter's email after validation.
* Resend template variables have a 2,000 character limit, which also limits the contact message to 2,000 characters.

## Local Development Flow

Run the development server with CSS watching enabled:

```bash
pnpm dev
```

The application defaults to `http://localhost:3000`.

### Local Validation and Preview

Before pushing code, run the local preview and verify scripts to ensure everything is correct:

```bash
pnpm run preview
pnpm run verify
```

The `verify` script runs the full quality gate: typechecking, testing, linting with Biome, and building the application.

## Push and PR Validation

This repository enforces a strict Git and CI workflow:

1. **Local Pre-push Hook**: A git hook managed by `simple-git-hooks` automatically runs before `git push`. It performs a fast check (`pnpm install --frozen-lockfile --lockfile-only`) to block the push if `pnpm-lock.yaml` is out of sync with `package.json`. If it fails, run `pnpm install` and commit the changes before pushing.
2. **GitHub Actions Pipeline**: Every push to `main` and every Pull Request triggers the Verify workflow. This pipeline runs the full `pnpm run verify` gate on Node 24.

## Deployment Flow

The deployment model is host-driven via Vercel and separate from the CI pipeline.

* **Preview Environments**: Vercel automatically deploys every Pull Request to a unique preview URL.
* **Production**: Vercel automatically deploys pushes to the `main` branch to production.

The application is configured for Vercel in `vercel.json`. Deployment behavior is as follows:

* `pnpm install --frozen-lockfile` installs dependencies as configured in `vercel.json`.
* `pnpm run build` generates `public/css/main.css` and compiles TypeScript to `dist/`.
* Vercel serves existing static files first.
* All remaining routes go to `api/index.ts`, which loads the Express application from `src/server.ts`.

### Critical Integrations

The application is designed to fail loudly in production instead of silently succeeding if critical integrations are missing. During startup, if required environment variables like `RESEND_API_KEY` and `CONTACT_TO` are missing, the server will throw an error and crash.

Add these variables in your Vercel Project Settings:

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

Most page copy and structured content is located in:

* `src/data/site.ts`
* `src/data/projects.ts`

Pug view partials are located in `src/views/partials/`.

After changing styles or Pug class names, run:

```bash
pnpm build
```

## Security Notes

* `.env` is ignored and must never be committed.
* Helmet is enabled with a nonce-based Content Security Policy.
* Contact form requests are rate limited.
* User-submitted email content is escaped before inline HTML email fallback rendering.
* Tests use a fake email sender to avoid accidental live email delivery.
