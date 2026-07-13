# Umais Ali Portfolio — Express/Pug to Astro/Svelte Migration Plan

> Repository: `aqeelmusab/umais-ali`  
> Current application version reviewed: `2.4.6`  
> Migration target: Astro + Svelte 5 islands + TypeScript + Tailwind CSS 4 + Motion + Resend + Vercel  
> Document status: Implementation plan  
> Last updated: 2026-07-12

---

## 1. Executive summary

The current application is not technically obsolete. It is a disciplined server-rendered portfolio built with Express 5, Pug 3, HTMX 2, TypeScript 6, Tailwind CSS 4, GSAP, Resend, Helmet, a nonce-based Content Security Policy, form validation, rate limiting, and Node tests.

The migration is therefore **not a rescue operation**. It is an architectural simplification and authoring-experience improvement.

The target architecture will:

- prerender all content-oriented pages as static HTML;
- keep only the contact submission endpoint on the server;
- use Astro components for layouts, pages, and content sections;
- use Svelte only for interaction that benefits from durable client-side state;
- preserve the current design, content, URLs, metadata, security posture, accessibility behavior, and contact-form semantics during the parity phase;
- remove Express, Pug, HTMX, Helmet, and the custom Vercel catch-all function after parity is proven;
- preserve TypeScript, pnpm, Node 24, Tailwind CSS 4, Resend, Biome, self-hosted fonts, Vercel Analytics, and Speed Insights while replacing the current GSAP enhancement layer with Motion;
- add real project detail routes while retaining the existing project-dialog experience as progressive enhancement;
- avoid turning the site into a globally server-rendered Astro application.

The migration should be performed incrementally, with a parity checkpoint before any content-model redesign or visual changes.

---

## 2. Decision record

### 2.1 Final stack

```text
Astro
├── Static Astro pages and components
├── Svelte 5 client island for project-dialog state
├── TypeScript
├── Tailwind CSS 4 through @tailwindcss/vite
├── Motion for animation
├── Astro server endpoint for contact submission
├── Resend for email delivery
├── @astrojs/vercel adapter
├── Vercel hosting, previews, analytics, and speed insights
├── Biome for linting and formatting
├── Node test runner for pure modules
└── Playwright for browser-critical behavior
```

### 2.2 Rendering policy

The project remains in Astro's default static output mode.

Only routes that genuinely require request-time execution may opt out of prerendering.

```text
Prerendered
├── /
├── /services
├── /services/[slug]
├── /projects/[slug]
├── /404.html
├── /og-image.png
├── /robots.txt
└── /sitemap-index.xml or /sitemap-0.xml

On-demand
└── POST /api/contact
```

`output: "server"` must not be enabled globally.

### 2.3 Framework boundary

Use Astro by default. Use Svelte by exception.

A component belongs in Svelte only when it owns meaningful browser state, such as:

- open/closed dialog state;
- active project selection;
- previous/next navigation;
- focus return;
- keyboard navigation;
- URL/history synchronization.

A component does **not** belong in Svelte merely because it contains a button, animation, loop, condition, or event listener.

### 2.4 Explicit exclusions

The migration must not introduce:

- React;
- Next.js;
- SvelteKit;
- TanStack Start;
- a CMS;
- a database;
- global client-side routing;
- Astro View Transitions during the parity phase;
- a general state-management library;
- a component library;
- a visual redesign;
- new marketing copy disguised as migration work;
- broad CSS cleanup before parity;
- a second frontend runtime for a feature already owned by Svelte or Astro;
- GSAP in the final production bundle;
- unofficial Svelte wrappers around Motion.

---

## 3. Migration goals

### 3.1 Primary goals

1. Replace Pug templates with readable, typed Astro components.
2. Replace the Express catch-all renderer with static output for content pages.
3. Reduce the request-time server surface to the contact endpoint.
4. Preserve or improve Core Web Vitals.
5. Preserve all SEO metadata and structured data.
6. Preserve all contact-form security and validation behavior.
7. Replace the HTMX project-fragment workflow with progressive enhancement around real project URLs.
8. Keep client JavaScript narrowly scoped.
9. Improve test coverage around browser interactions and generated output.
10. Make future service and project pages easier to author and maintain.
11. Replace the current GSAP animation layer with Motion without changing the visual language or accessibility behavior.

### 3.2 Success indicators

The migration is successful when:

- all existing public pages render equivalent content and metadata;
- all existing canonical URLs still resolve correctly;
- static routes produce static files in `dist/`;
- only `/api/contact` creates a request-time server function;
- the site remains usable with JavaScript disabled;
- project cards are ordinary links without JavaScript;
- project cards open an accessible dialog after Svelte hydration;
- the contact form works both with and without enhancement;
- the generated OG image remains a valid 1200×630 PNG;
- invalid contact submissions retain their values and field errors;
- honeypot hits receive a fake success response;
- origin/referrer checks remain strict;
- tests, type checks, linting, build, and browser smoke tests pass;
- Vercel preview and production behavior match local preview behavior;
- Motion reproduces the current reveal, magnetic-tilt, count-up, and dialog-stagger behavior;
- no GSAP runtime, vendored GSAP file, or `window.gsap` dependency remains in the final build.

---

## 4. Non-goals

The first production release of the migration will not:

- redesign the site;
- rewrite the copy;
- introduce a CMS;
- turn every data object into Markdown;
- recreate advanced GSAP capabilities that the current site does not use, such as ScrollTrigger pinning, scrubbed storytelling, SVG morphing, or complex timeline orchestration;
- migrate self-hosted fonts to a font service;
- optimize every image format;
- add authentication;
- add a database-backed contact inbox;
- add user accounts;
- add a blog;
- add internationalization;
- change the email provider;
- change the domain;
- switch hosting providers;
- change analytics products;
- adopt Astro Actions unless the static-page constraint changes;
- adopt View Transitions until all page-level scripts are lifecycle-safe.

These can be considered after the parity release.

---

## 5. Current-system baseline

### 5.1 Current routes

| Route | Method | Current responsibility |
|---|---:|---|
| `/` | GET | Render portfolio homepage through Pug |
| `/services` | GET | Render service index |
| `/services/:slug` | GET | Render a service detail page or Pug 404 |
| `/projects/:id` | GET | Return an HTMX modal fragment |
| `/contact/form` | GET | Return a fresh contact-form fragment |
| `/contact` | POST | Validate, protect, rate-limit, send email, and return a fragment |
| `/og-image.png` | GET | Generate a PNG using Satori and resvg |
| `*` | GET | Render Pug 404 |
| `/public/*` | GET | Serve static files |

### 5.2 Current server responsibilities

`src/server.ts` currently owns too many unrelated concerns:

- Express application creation;
- proxy trust;
- Pug configuration;
- CSP nonce creation;
- Helmet security headers;
- static file serving;
- form parsing;
- contact rate limiting;
- global template locals;
- SEO data assembly;
- JSON-LD assembly;
- page routing;
- service lookup;
- project-fragment rendering;
- contact validation;
- CSRF-style origin checks;
- email orchestration;
- 404 handling;
- local server startup;
- Vercel serverless adaptation.

The migration should separate those concerns into build-time pages, reusable libraries, and one server endpoint.

### 5.3 Current client responsibilities

`public/js/site-main.js` currently manages:

- smooth anchor scrolling;
- scroll locking;
- focus trapping;
- sticky-header state;
- mobile-menu state;
- project-dialog state;
- HTMX swap events;
- Escape handling;
- arrow-key project navigation;
- scroll-to-top state;
- theme state;
- contact error swap behavior.

`public/js/animations.js` currently owns GSAP-driven reveal behavior, magnetic tilt, statistic count-up, dialog-content stagger, and animation fallbacks. These behaviors form the Motion parity checklist.

The target architecture should not simply copy this file into Astro. It should split stateful dialog behavior from lightweight page behavior.

### 5.4 Current security behavior to preserve

- CSP with restrictive source directives;
- no third-party runtime CDN;
- security headers;
- body size capped at 32 KB;
- server-side contact validation;
- honeypot behavior;
- per-client request throttling;
- exact origin comparison;
- exact referrer-origin comparison;
- HTML escaping in fallback email markup;
- CR/LF stripping for email headers;
- capped user-agent length;
- production startup failure when required email configuration is missing;
- no accidental email delivery from tests.

### 5.5 Current quality gates

The existing project already has:

- strict TypeScript;
- Node's built-in test runner;
- Biome;
- a `verify` script;
- a pre-push hook;
- GitHub Actions verification;
- frozen-lockfile installs;
- Vercel preview deployments.

These are migration assets, not things to replace casually.

---

## 6. Target architecture

### 6.1 Request and build flow

```text
                           pnpm build
                               │
                               ▼
                    Astro static generation
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
             Static HTML/assets   Static OG image
                     │
                     └─────────┬─────────┘
                               ▼
                        Vercel CDN output


Browser ───────────────────────────────► Static pages and assets
   │
   ├── hydrates only project dialog ──► Svelte island
   │
   ├── executes lightweight scripts ──► theme/nav/Motion/form enhancement
   │
   └── POST /api/contact ─────────────► Astro server endpoint
                                           │
                                           ├── validate
                                           ├── anti-abuse checks
                                           ├── rate-limit adapter
                                           └── Resend
```

### 6.2 Proposed project tree

```text
.
├── .github/
│   └── workflows/
│       └── verify.yml
├── public/
│   ├── favicons/
│   ├── fonts/
│   ├── images/
│   ├── js/
│   │   └── theme-init.js
│   └── site.webmanifest
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── MobileMenu.astro
│   │   │   ├── Footer.astro
│   │   │   └── ScrollToTop.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Marquee.astro
│   │   │   ├── SelectedWork.astro
│   │   │   ├── Services.astro
│   │   │   ├── About.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── Faq.astro
│   │   │   └── Contact.astro
│   │   ├── services/
│   │   │   ├── ServiceCard.astro
│   │   │   ├── ServiceHero.astro
│   │   │   ├── ServiceOutcomes.astro
│   │   │   ├── ServiceProcess.astro
│   │   │   └── RelatedServices.astro
│   │   ├── projects/
│   │   │   ├── ProjectCard.astro
│   │   │   ├── ProjectDetail.astro
│   │   │   └── ProjectNavigation.astro
│   │   ├── islands/
│   │   │   └── ProjectDialog.svelte
│   │   └── seo/
│   │       └── StructuredData.astro
│   ├── data/
│   │   ├── projects.ts
│   │   └── site.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── contact/
│   │   │   ├── contract.ts
│   │   │   ├── validate.ts
│   │   │   ├── send-email.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── responses.ts
│   │   ├── env/
│   │   │   ├── public.ts
│   │   │   └── server.ts
│   │   ├── projects/
│   │   │   └── navigation.ts
│   │   └── seo/
│   │       ├── metadata.ts
│   │       └── structured-data.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── services/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── projects/
│   │   │   └── [slug].astro
│   │   ├── api/
│   │   │   └── contact.ts
│   │   └── og-image.png.ts
│   ├── scripts/
│   │   ├── page.ts
│   │   ├── contact-form.ts
│   │   └── animations.ts
│   └── styles/
│       └── global.css
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── astro.config.ts
├── svelte.config.js
├── biome.json
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vercel.json
```

This is a target structure, not a requirement to create every file immediately. Do not split a component only to satisfy the diagram.

---

## 7. Route migration matrix

| Current route | Target route | Target mode | Migration behavior |
|---|---|---|---|
| `/` | `/` | Static | Preserve content, sections, IDs, metadata, and anchors |
| `/services` | `/services` | Static | Preserve URL and canonical |
| `/services/:slug` | `/services/[slug]` | Static | Generate with `getStaticPaths()` |
| `/projects/:id` | `/projects/[slug]` | Static | Replace fragments with real pages; preserve legacy ID redirects |
| `/contact/form` | Removed | N/A | Initial form is static HTML; reset client-side |
| `/contact` | `/api/contact` | On-demand | New endpoint contract; retain temporary redirect/alias if needed |
| `/og-image.png` | `/og-image.png` | Static endpoint | Generate at build time |
| unknown route | `404.astro` | Static | Preserve `noindex, nofollow` |
| static files | `/public/*` | Static | Preserve paths where possible |

### 7.1 URL policy

Set:

```ts
trailingSlash: "never"
```

This preserves the current URL style and avoids duplicate canonical forms.

### 7.2 Legacy redirects

Add permanent redirects only after the target pages exist.

Recommended compatibility rules:

```text
/projects/1  -> /projects/greenleaf-organics
/projects/2  -> /projects/cloudstack-saas
/projects/3  -> /projects/metro-dental-group
/projects/4  -> /projects/stylevault-magazine
/projects/5  -> /projects/fitpro-equipment

/contact     -> /api/contact
```

The `/contact` rule needs method-aware handling during the cutover. Do not use a normal 301/308 for POST requests without testing how Vercel and browsers preserve the method and body. The safer transition is to temporarily expose both endpoint paths from the same handler, then remove `/contact` after the frontend and production logs confirm no remaining use.

---

## 8. Package migration

### 8.1 Add

```text
astro
@astrojs/svelte
svelte
@astrojs/vercel
@astrojs/sitemap
@tailwindcss/vite
motion
@playwright/test
```

Keep:

```text
@resvg/resvg-js
resend
satori
tailwindcss
typescript
@biomejs/biome
simple-git-hooks
```

### 8.2 Remove after parity

```text
express
@types/express
express-rate-limit
helmet
pug
@types/pug
htmx.org
gsap
@tailwindcss/cli
npm-run-all
tsx
```

`tsx` may remain temporarily if existing Node tests still need it. Remove it only after the test runner can execute the final TypeScript setup without it.

### 8.3 Do not bulk-update unrelated dependencies

The framework migration and dependency modernization should not be one giant change. Pin a coherent Astro/Svelte/Vercel set, regenerate the lockfile, and defer unrelated upgrades.

---

## 9. Astro configuration

An initial configuration should resemble:

```ts
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://umaisali.com",
  trailingSlash: "never",
  adapter: vercel(),
  integrations: [svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Rules:

- do not set `output: "server"`;
- add `export const prerender = false` only to the contact endpoint;
- keep the canonical site origin in one location;
- do not manually duplicate routing in `vercel.json` when Astro can generate it;
- do not add View Transitions during parity;
- do not add experimental Astro flags unless a specific requirement justifies them.

---

## 10. TypeScript configuration

Replace the current Node-specific `NodeNext` application configuration with Astro's strict base:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true
  }
}
```

Adopt additional flags only after fixing their findings intentionally.

Do not use broad `any` casts to rush the migration.

Generate Astro types before CI checks when necessary:

```bash
pnpm astro sync
pnpm astro check
```

The final type-check command should cover:

- `.astro`;
- `.svelte`;
- application TypeScript;
- tests, through an appropriate secondary test configuration if needed.

---

## 11. Content and data strategy

### 11.1 Parity phase

Keep `src/data/site.ts` and `src/data/projects.ts` as TypeScript during the first migration release.

Reasons:

- the current data is already typed;
- service entries contain substantial nested structured data;
- migrating templates and migrating content formats simultaneously makes parity harder to prove;
- a framework migration should not create unnecessary content diffs;
- TypeScript data works naturally with `getStaticPaths()`.

### 11.2 Required project-schema change

Add stable slugs:

```ts
export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  year: string;
  client: string;
  role: string;
  result?: string;
}
```

Slug rules:

- lowercase;
- ASCII;
- hyphen-separated;
- permanent after publication;
- never derived at runtime from a mutable title;
- validated for uniqueness in a unit test.

### 11.3 Service validation

Introduce an explicit `Service` interface or schema rather than relying only on inference from a large array.

Validate:

- unique service slugs;
- every `relatedSlugs` value resolves;
- no service relates to itself;
- meta titles and descriptions are non-empty;
- required arrays are non-empty;
- every route can be generated.

### 11.4 Optional post-parity content collections

After launch, projects may move to Astro content collections or Markdown when longer case studies justify prose-oriented authoring.

Do not move the service model into Markdown merely because Astro supports Markdown. Its nested structure may remain clearer as typed data.

---

## 12. Layout migration

### 12.1 `layout.pug` to `BaseLayout.astro`

`BaseLayout.astro` must own:

- document language;
- theme classes and color-scheme declaration;
- viewport and application metadata;
- page title;
- page description;
- robots;
- Googlebot directives;
- canonical link;
- Open Graph metadata;
- Twitter metadata;
- favicons;
- manifest;
- critical font preloads;
- global stylesheet import;
- structured data;
- analytics components or scripts;
- global client scripts.

Suggested props:

```ts
interface Props {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  robots?: string;
  googlebot?: string;
  structuredData?: unknown;
}
```

### 12.2 Metadata invariants

Preserve exactly:

- default title;
- default description;
- canonical construction;
- `index, follow` defaults;
- expanded Googlebot directives;
- OG locale;
- OG site name;
- OG image dimensions;
- OG image alt;
- Twitter card;
- Twitter site;
- Twitter creator;
- Twitter image alt;
- theme-color values for light and dark modes.

Create tests against built HTML instead of trusting visual inspection.

### 12.3 Structured data

Move JSON-LD construction out of page templates into typed helper functions:

```text
src/lib/seo/structured-data.ts
```

Suggested exports:

```ts
createSiteGraph()
createServiceGraph(service)
createProjectGraph(project)
```

Requirements:

- preserve `WebSite`, `Person`, and `ProfilePage`;
- add `Service` only on service pages;
- add `CreativeWork` or `Article` only if the project-page content supports it;
- never emit invalid or empty fields;
- keep all URLs absolute;
- test JSON parsing from generated HTML;
- validate representative pages with Google's Rich Results Test after preview deployment.

---

## 13. Pug-to-Astro component migration rules

### 13.1 Preserve markup before improving it

For each Pug partial:

1. copy the semantic structure into an Astro component;
2. preserve element order;
3. preserve IDs;
4. preserve ARIA attributes;
5. preserve `data-*` animation hooks;
6. preserve class strings;
7. preserve link destinations;
8. preserve image paths and alt text;
9. compare built HTML;
10. only then refactor repetition.

### 13.2 Suggested mapping

| Current Pug area | Target |
|---|---|
| `src/views/layout.pug` | `src/layouts/BaseLayout.astro` |
| `src/views/index.pug` | `src/pages/index.astro` |
| `src/views/services.pug` | `src/pages/services/index.astro` |
| `src/views/service-detail.pug` | `src/pages/services/[slug].astro` |
| `src/views/404.pug` | `src/pages/404.astro` |
| `partials/header.pug` | `components/layout/Header.astro` |
| `partials/hero.pug` | `components/sections/Hero.astro` |
| `partials/marquee.pug` | `components/sections/Marquee.astro` |
| `partials/selected-work.pug` | `components/sections/SelectedWork.astro` |
| `partials/services.pug` | `components/sections/Services.astro` |
| `partials/about.pug` | `components/sections/About.astro` |
| `partials/testimonials.pug` | `components/sections/Testimonials.astro` |
| `partials/faq.pug` | `components/sections/Faq.astro` |
| `partials/contact.pug` | `components/sections/Contact.astro` |
| `partials/footer.pug` | `components/layout/Footer.astro` |
| project modal partials | `ProjectDialog.svelte` plus Astro project pages |
| contact response partials | typed endpoint responses plus inline result UI |

### 13.3 Avoid component fragmentation

Do not create a component for every small wrapper.

Create a component when at least one is true:

- it is reused;
- it owns a clear semantic unit;
- it accepts meaningful typed props;
- it isolates a distinct behavior;
- it improves testability;
- it meaningfully reduces page complexity.

---

## 14. Styling migration

### 14.1 Tailwind integration

Replace the standalone Tailwind CLI build with `@tailwindcss/vite`.

Move:

```text
src/styles/main.css
```

to:

```text
src/styles/global.css
```

or keep the name if changing it provides no value.

Import it once from `BaseLayout.astro`.

### 14.2 Source detection

Remove Pug-specific source declarations:

```css
@source "../views/**/*.pug";
@source "../../public/js/**/*.js";
```

Astro and Svelte files should be detected through the Vite build. Add explicit `@source` rules only when a real detection gap is proven.

If JavaScript contains complete static class names that Tailwind must scan, include the relevant source directory deliberately.

### 14.3 Preserve theme tokens

Do not alter:

- OKLCH color tokens;
- font families;
- radius tokens;
- theme switching;
- scroll-lock classes;
- typography features;
- global transitions;
- reduced-motion behavior.

### 14.4 CSS parity process

For each page:

- capture desktop and mobile screenshots from the current site;
- capture the same viewports from Astro preview;
- compare typography wrapping;
- compare spacing;
- compare fixed/sticky positioning;
- compare modal dimensions;
- compare light/dark theme;
- compare focus rings;
- compare reduced-motion mode;
- fix markup/class differences before rewriting CSS.

### 14.5 Asset strategy

Keep public paths unchanged during parity:

```text
/fonts/*
/images/*
/favicons/*
```

Do not migrate all images into `src/assets` during the first release. That would change asset URLs and complicate visual and SEO parity.

---

## 15. Theme initialization and flash prevention

The current site uses a nonce-protected inline script before first paint.

Static HTML cannot receive a unique request-time nonce. Do not fake a static nonce.

Use one of these two controlled strategies:

### Preferred strategy

Create a tiny stable theme initializer:

```text
public/js/theme-init.js
```

Load it synchronously in `<head>` before the stylesheet:

```html
<script src="/js/theme-init.js"></script>
```

Characteristics:

- no third-party dependency;
- tiny payload;
- immutable logic;
- same-origin;
- no inline script requirement;
- CSP remains `script-src 'self'`;
- test the page under throttled network conditions for theme flash.

If the extra request causes a visible flash, preload the script or evaluate the hash strategy below.

### Alternative strategy

Keep the initializer inline and add its exact SHA-256 hash to CSP.

Rules:

- keep the initializer byte-for-byte stable;
- automate hash calculation;
- fail CI when the configured hash does not match the script;
- never add `'unsafe-inline'`;
- document the update command next to the CSP configuration.

Do not use per-request nonces on static pages.

---

## 16. Svelte project-dialog island

### 16.1 Responsibility

`ProjectDialog.svelte` owns only the enhanced dialog experience.

It must not own the project cards or the whole selected-work section.

### 16.2 Progressive-enhancement contract

Before hydration:

- every project card is a normal `<a href="/projects/<slug>">`;
- clicking opens a full project page;
- all content remains available;
- no button depends on JavaScript for navigation.

After hydration:

- the island intercepts eligible same-origin project links;
- opens an accessible dialog;
- renders the selected project;
- updates the URL with `history.pushState`;
- supports browser Back/Forward;
- closes back to the originating page state;
- restores focus to the triggering card;
- supports Escape;
- supports previous/next keyboard navigation;
- locks scrolling;
- respects reduced motion.

### 16.3 Data strategy

Because the project set is small, pass a compact serialized project summary to the island.

Do not fetch an HTML fragment from `/projects/:id`.

If project content becomes large later, switch to:

- a JSON endpoint;
- dynamic imports;
- or navigation to the full page.

Do not prematurely build an API for five projects.

### 16.4 Hydration directive

Use:

```astro
<ProjectDialog projects={projects} client:visible />
```

when the selected-work section is below the fold and the island wrapper can become visible normally.

Use `client:idle` if visibility semantics are unreliable.

Use `client:load` only if testing proves users can interact before the other directives hydrate.

### 16.5 Accessibility requirements

The dialog must:

- use the native `<dialog>` element when browser behavior and styling are acceptable, or implement equivalent ARIA correctly;
- have an accessible name;
- move focus into the dialog on open;
- trap focus while open;
- return focus on close;
- close on Escape;
- mark the background inert;
- avoid duplicate IDs;
- announce content changes where necessary;
- keep previous/next controls disabled or absent at boundaries;
- remain operable at 200% zoom;
- avoid scroll loss on close.

### 16.6 State model

Suggested state:

```ts
type DialogState = {
  open: boolean;
  activeSlug: string | null;
  returnUrl: string;
  trigger: HTMLElement | null;
};
```

History rules must be documented and tested. Avoid recursive `popstate` updates.

---

## 17. Lightweight page scripts

Keep non-stateful browser behavior outside Svelte:

```text
src/scripts/page.ts
```

Responsibilities may include:

- sticky header class;
- mobile-menu enhancement if it remains simple;
- anchor scrolling;
- scroll-to-top visibility;
- theme toggle;
- small DOM affordances.

Guidelines:

- use event delegation where appropriate;
- use passive scroll listeners;
- schedule visual writes through `requestAnimationFrame`;
- avoid global mutable state except where unavoidable;
- guard missing elements;
- respect reduced motion;
- clean up listeners if View Transitions are adopted later;
- do not duplicate behavior owned by `ProjectDialog.svelte`.

During parity, do not add Astro View Transitions. They change script lifecycle and make parity debugging harder.

---

## 18. Motion migration

### 18.1 Decision

Replace the current GSAP enhancement layer with the framework-neutral `motion` package during the Astro migration.

The current site uses GSAP for:

- reveal-on-scroll transforms;
- magnetic card tilt;
- hero statistic count-up;
- staggered project-dialog content.

It does not depend on:

- complex timelines;
- ScrollTrigger;
- scroll pinning;
- scrubbed sequences;
- SVG morphing;
- draggable behavior;
- advanced FLIP orchestration.

Motion is therefore the smaller conceptual fit for the animation surface the site actually has.

The final production build must not contain both GSAP and Motion.

### 18.2 Package and import policy

Install:

```text
motion
```

Use Motion's framework-neutral JavaScript API:

```ts
import {
  animate,
  inView,
  motionValue,
  springValue,
  stagger,
  styleEffect,
} from "motion";
```

Do not introduce:

- an unofficial Svelte animation wrapper;
- a React-specific Motion package;
- a global `window.motion` object;
- a vendored Motion runtime;
- manual SRI maintenance for the bundled animation library.

Use the hybrid animator rather than `motion/mini` because the current effects need:

- independent transform properties such as `x`, `y`, `scale`, `rotateX`, and `rotateY`;
- JavaScript number animation for statistic counters;
- transform composition;
- staggered multi-element animation.

Let Vite bundle and fingerprint the imported modules.

### 18.3 Ownership boundary

Motion may animate DOM rendered by Astro without requiring that DOM to become a Svelte island.

Use:

```text
src/scripts/animations.ts
```

for Astro-owned page animation.

Use Motion inside `ProjectDialog.svelte` only for dialog-owned elements and only where Svelte already owns the lifecycle.

Animation code must never become the source of truth for:

- whether the dialog is open;
- which project is active;
- focus state;
- history state;
- accessibility attributes;
- inert state;
- scroll-lock state.

Those remain behavioral state, not animation state.

### 18.4 Current-to-target mapping

| Current implementation | Motion target |
|---|---|
| `IntersectionObserver` + `gsap.to()` | `inView()` + `animate()` |
| `gsap.set()` initial transforms | CSS initial state or first `animate()` keyframe |
| `gsap.quickTo()` magnetic tilt | `motionValue()` + `springValue()` + `styleEffect()` |
| `gsap.to({ value })` count-up | `animate(0, target, { onUpdate })` |
| `gsap.fromTo(..., { stagger })` | `animate()` + `stagger()` |
| `htmx:afterSettle` modal hook | Svelte lifecycle/reactive update in `ProjectDialog.svelte` |

### 18.5 Reveal-on-scroll

Use `inView()` for one-time reveal behavior.

Requirements:

- initial content remains visible when JavaScript fails;
- CSS may apply hidden transform/opacity only after an animation-capable marker is set;
- each element animates once;
- unobserve or stop tracking after reveal;
- preserve the current viewport threshold and bottom margin;
- preserve reduced-motion behavior;
- keep DOM content available before animation initialization.

Representative pattern:

```ts
import { animate, inView } from "motion";

const stop = inView(
  ".reveal",
  (element) => {
    animate(
      element,
      {
        opacity: [0, 1],
        y: [32, 0],
        scale: [0.97, 1],
      },
      {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    );

    return () => {
      // Optional per-element cleanup if a future effect needs it.
    };
  },
  {
    amount: 0.15,
    margin: "0px 0px -8% 0px",
  },
);
```

Store and invoke `stop` when the page-script lifecycle requires cleanup.

### 18.6 Magnetic card tilt

Use pointer events to update Motion values.

Do not create a new `animate()` call on every pointer movement.

Suggested model:

```ts
const targetRotateX = motionValue(0);
const targetRotateY = motionValue(0);
const targetScale = motionValue(1);

const rotateX = springValue(targetRotateX, {
  stiffness: 220,
  damping: 24,
});

const rotateY = springValue(targetRotateY, {
  stiffness: 220,
  damping: 24,
});

const scale = springValue(targetScale, {
  stiffness: 220,
  damping: 24,
});

const cancelStyle = styleEffect(card, {
  rotateX,
  rotateY,
  scale,
});
```

Requirements:

- enable only for `(hover: hover) and (pointer: fine)`;
- preserve the current maximum tilt;
- use `pointermove` rather than mouse-only handling;
- reset all target values on `pointerleave` and `pointercancel`;
- avoid forced layout beyond one `getBoundingClientRect()` per event;
- preserve transform perspective;
- disable the effect for reduced motion;
- clean up listeners, effects, and reactive values.

### 18.7 Statistic count-up

Animate numbers directly:

```ts
const controls = animate(0, target, {
  duration: 1.3,
  delay,
  ease: "easeOut",
  onUpdate: (value) => {
    element.textContent = `${Math.round(value)}${suffix}`;
  },
  onComplete: () => {
    element.textContent = original;
  },
});
```

Requirements:

- retain the original text as the no-JavaScript and reduced-motion value;
- do not replace meaningful content with zero in server-rendered HTML;
- skip malformed statistic strings;
- restore exact original text on completion;
- cancel controls during teardown when relevant;
- avoid announcing every intermediate number to assistive technology.

### 18.8 Project-dialog stagger

The Svelte dialog may call a small Motion helper after active project content is committed.

Representative pattern:

```ts
animate(
  blocks,
  {
    opacity: [0, 1],
    y: [18, 0],
  },
  {
    duration: 0.55,
    delay: stagger(0.07, { startDelay: 0.05 }),
    ease: [0.34, 1.56, 0.64, 1],
  },
);
```

Requirements:

- do not depend on HTMX events;
- cancel the previous content animation before starting another;
- avoid animating stale nodes after rapid previous/next navigation;
- reveal content immediately for reduced motion;
- focus management must complete independently of the animation;
- do not delay accessible content availability until animation finishes.

### 18.9 Reduced-motion policy

Create one shared helper or media-query utility.

When `prefers-reduced-motion: reduce` matches:

- skip reveal translations and scaling;
- display reveal content immediately;
- skip magnetic tilt;
- skip count-up and retain final numbers;
- skip dialog stagger;
- preserve functional state changes without animated delay.

The reduced-motion path must not depend on Motion loading successfully.

### 18.10 Failure and fallback behavior

Motion is progressive enhancement.

If the module fails to load:

- all page content must remain visible;
- project links must still navigate;
- dialog state must not become partially initialized;
- statistics must show their final server-rendered values;
- no element may remain permanently transparent or transformed off-screen.

Prefer CSS that is visible by default and opt into pre-animation states only after JavaScript has initialized successfully.

### 18.11 Cleanup and lifecycle

Every animation or subscription with a cleanup mechanism must be cleaned up.

Track:

- `inView()` stop functions;
- active animation controls;
- `styleEffect()` cleanup functions;
- pointer listeners;
- media-query listeners;
- Svelte `onDestroy` cleanup;
- stale dialog-content animations.

Do not initialize the same animation module twice.

If Astro View Transitions are adopted later, revisit initialization and cleanup around Astro's page lifecycle events before enabling them.

### 18.12 Performance and verification

Measure the built result rather than assuming Motion is automatically smaller or faster.

Verify:

- one Motion runtime in the bundle;
- no GSAP payload;
- no vendored `gsap-*.min.js`;
- no duplicate animation initialization;
- no continuous animation loop while idle;
- no magnetic-tilt work on coarse pointers;
- no reveal observer after all elements have animated;
- no layout shift from animation initialization;
- no regression in INP;
- no reduced-motion violations.

Use browser performance tooling on the homepage and project dialog.

### 18.13 Removal checklist

After Motion parity is approved:

- remove `gsap` from `package.json`;
- remove the vendored GSAP file;
- remove GSAP SRI entries;
- remove `window.gsap` checks;
- remove `gsap.set`, `gsap.to`, `gsap.fromTo`, and `gsap.quickTo`;
- remove old HTMX animation event hooks;
- rename comments and tests that refer to GSAP;
- verify `pnpm why gsap` returns no dependency;
- search built assets for `gsap`;
- update README animation documentation.


---

## 19. Contact form architecture

### 19.1 Baseline decision

The contact form remains Astro-rendered HTML with a small progressive-enhancement script.

Do not make the entire homepage dynamic.

Do not use Astro Actions in the first release because a zero-JavaScript action flow would require the form page itself to render on demand.

### 19.2 Endpoint

```text
src/pages/api/contact.ts
```

At the top:

```ts
export const prerender = false;
```

Support `POST`. Return `405 Method Not Allowed` with an `Allow: POST` header for unsupported methods.

### 19.3 Request formats

Accept:

- `application/x-www-form-urlencoded`;
- optionally `application/json` for enhanced clients.

Reject unsupported content types with `415 Unsupported Media Type`.

Enforce the body-size limit before parsing where the runtime permits. Do not rely only on field-length validation.

### 19.4 Response contract

Enhanced request:

```json
{
  "ok": false,
  "errors": {
    "email": "Please enter a valid email address."
  },
  "values": {
    "name": "Jane",
    "email": "bad",
    "message": "..."
  },
  "message": "Please correct the highlighted fields."
}
```

Suggested statuses:

| Situation | Status |
|---|---:|
| Delivered | `200` |
| Honeypot hit | `200` fake success |
| Validation failure | `422` |
| Origin/referrer failure | `403` |
| Rate limit | `429` |
| Unsupported content type | `415` |
| Upstream delivery failure | `502` or controlled `200` UI response |
| Unsupported method | `405` |

The current UI treats email delivery failure as a recoverable visible result rather than a generic browser error. Preserve that user experience even if the HTTP status becomes more semantically precise.

### 19.5 No-JavaScript fallback

A plain HTML form POST must not strand the user on raw JSON.

Use content negotiation:

- enhanced script sends `Accept: application/json`;
- ordinary browser form submission receives a small complete HTML result page;
- the result page links back to `/#contact`;
- errors may render a complete retry form with preserved values;
- success renders a complete confirmation document.

Alternative: use a dedicated on-demand `/contact/result` page and a `303` redirect. Do not encode the submitted message in a query string.

### 19.6 Validation

Move current pure validation behavior with no semantic changes:

- name: 2–80 characters;
- email: pragmatic shape validation and maximum length;
- message: 10–2000 characters;
- trim values;
- preserve values on validation failure;
- honeypot remains independent of normal validation.

The existing pure functions should be preserved and their tests migrated first.

### 19.7 Origin protection

Keep exact origin comparison:

```ts
new URL(value).origin === expectedOrigin
```

Rules:

- reject mismatched `Origin`;
- if `Origin` is absent and `Referer` exists, compare parsed origins;
- reject malformed referrers;
- do not use `startsWith`;
- determine and document behavior when both headers are absent;
- use the canonical production origin from validated server environment;
- allow expected Vercel preview origins only in preview environments, not production.

### 19.8 IP extraction

Do not blindly trust arbitrary forwarding headers.

On Vercel, use the platform-supported client-IP mechanism or a tightly defined header order. Normalize IPv6 where necessary.

Cap and sanitize logging fields.

### 19.9 Rate limiting

The current in-memory Express limiter is only best-effort in a serverless environment because different instances do not share memory.

Target design:

```ts
export interface ContactRateLimiter {
  consume(key: string): Promise<
    | { allowed: true }
    | { allowed: false; retryAfterSeconds: number }
  >;
}
```

Implementation options:

1. Vercel firewall/rate-limit rule, configured outside application code;
2. durable serverless limiter backed by a shared store;
3. documented best-effort local limiter for development only.

Do not silently claim distributed rate limiting while using process memory.

The production choice should be made before launch and documented in `README.md`.

### 19.10 Email delivery

Retain:

- lazy Resend client creation;
- published template support;
- fallback text and HTML;
- HTML escaping;
- header sanitization;
- Reply-To behavior;
- delivery result normalization;
- logging without message-body leakage;
- test injection or module mocking.

Never expose Resend errors, IDs, API keys, recipient addresses, IP addresses, or user agents in the browser response.

---

## 20. Environment configuration

### 20.1 Server-only variables

```env
RESEND_API_KEY=
CONTACT_FROM=
CONTACT_TO=
CONTACT_TEMPLATE_ID=
CONTACT_REPLY_TO=
CONTACT_RATE_WINDOW_MS=
CONTACT_RATE_MAX=
```

Use Astro server environment access and validation.

Do not prefix secrets with `PUBLIC_`.

### 20.2 Public configuration

The canonical site URL should normally come from `astro.config.ts` and `Astro.site`.

Public values should be exposed only when the browser genuinely needs them.

### 20.3 Validation behavior

Production builds or server startup must fail clearly when required contact-delivery settings are missing.

However, static page generation should not require Resend configuration when building a non-production local preview unless the selected adapter evaluates the endpoint during build.

Separate:

- build-time public configuration;
- request-time server secrets;
- test defaults.

### 20.4 Environment modes

Define expected behavior for:

- development;
- test;
- Vercel preview;
- production.

Preview must not accidentally send contact mail to the real recipient unless explicitly enabled.

Recommended preview behavior:

- use a test recipient;
- or disable delivery with a visible preview-only result;
- or gate delivery behind an explicit `ENABLE_CONTACT_DELIVERY=true`.

---

## 21. OG image migration

### 21.1 Target

```text
src/pages/og-image.png.ts
```

The endpoint should remain prerendered.

Astro will execute it at build time and emit a static PNG.

### 21.2 Preserve

- 1200×630 dimensions;
- current typography;
- current brand colors;
- Satori markup;
- resvg rendering;
- valid PNG bytes;
- deterministic output;
- absolute font loading during build;
- useful alt text in page metadata.

### 21.3 Font handling

Read local font files from the repository using build-safe URLs or filesystem access supported by Astro/Vite.

Do not fetch fonts over the public internet during build.

### 21.4 Caching

Because the file becomes content-addressed by deployment rather than generated per request, Vercel/CDN caching can be long-lived.

Set an explicit cache policy only if Astro/Vercel does not already provide an appropriate immutable/static policy.

### 21.5 Tests

Test:

- file exists after build;
- content type is PNG when served;
- byte length is non-trivial;
- PNG magic bytes are valid;
- dimensions are 1200×630;
- rebuild is deterministic when inputs are unchanged.

---

## 22. Security-header migration

### 22.1 Responsibility shift

Helmet currently creates headers inside Express.

After migration, security headers should be configured through:

- Astro middleware only for on-demand routes when required;
- `vercel.json` headers for static and dynamic routes;
- or adapter/platform configuration.

Prefer one central policy.

### 22.2 Baseline headers

Preserve or intentionally replace:

```text
Content-Security-Policy
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options or CSP frame-ancestors
Permissions-Policy
Strict-Transport-Security
Cross-Origin-Resource-Policy
```

Review whether `Cross-Origin-Embedder-Policy` is required; the current application disables it.

### 22.3 CSP target

A likely static-page CSP:

```text
default-src 'self';
base-uri 'self';
connect-src 'self';
font-src 'self';
form-action 'self';
frame-ancestors 'none';
img-src 'self' data:;
object-src 'none';
script-src 'self';
script-src-attr 'none';
style-src 'self';
style-src-attr 'none';
upgrade-insecure-requests;
```

Adjust only for verified Astro/Vercel analytics requirements.

Do not add:

```text
'unsafe-inline'
'unsafe-eval'
*
```

without a documented, tested reason.

### 22.4 Inline styles and Astro/Svelte

Verify generated output for:

- inline `style` attributes;
- inline framework bootstrap scripts;
- hydration payloads;
- JSON-LD;
- Vercel analytics injection.

CSP must be tested against the actual production build, not assumed from source code.

### 22.5 CSP test process

1. deploy preview with `Content-Security-Policy-Report-Only`;
2. exercise every page and interaction;
3. inspect browser console and reports;
4. eliminate avoidable violations;
5. pin required hashes or sources narrowly;
6. switch to enforcing policy;
7. repeat on production.

---

## 23. Analytics migration

The current layout manually inserts Vercel Analytics and Speed Insights scripts.

For Astro:

- use the current official Vercel-supported integration or components;
- do not paste old script snippets blindly;
- confirm both products work on static pages;
- include analytics only in intended environments;
- verify CSP sources;
- verify no duplicate page-view events;
- verify project-dialog URL changes do not incorrectly inflate page views unless desired;
- verify full project-page navigation records correctly.

Add a production smoke check for the presence of expected scripts, but do not couple tests to unstable minified implementation details.

---

## 24. 404 behavior

Create:

```text
src/pages/404.astro
```

Requirements:

- full HTML document through `BaseLayout`;
- status 404 on Vercel;
- `robots="noindex, nofollow"`;
- no canonical link;
- useful link back home;
- current visual design preserved;
- unknown service and project URLs resolve to this page;
- generated static fallback does not return 200.

Test against `astro preview` and Vercel preview because static-host fallback semantics can differ.

---

## 25. Service-page generation

Use `getStaticPaths()`:

```ts
export function getStaticPaths() {
  return services.map((service) => ({
    params: { slug: service.slug },
    props: { service },
  }));
}
```

At build time:

- validate every related service;
- derive related entries once;
- generate service JSON-LD;
- generate title, description, and canonical;
- render navigation and contact section links;
- fail the build on duplicate slugs.

Do not perform runtime service lookup for a static data set.

---

## 26. Project-page generation

### 26.1 New route

```text
src/pages/projects/[slug].astro
```

### 26.2 Minimum page content

Each page should include:

- title;
- category;
- summary;
- long description;
- image;
- year;
- client;
- role;
- result;
- tags;
- previous/next navigation;
- contact CTA;
- canonical;
- OG metadata;
- useful structured data when justified.

### 26.3 Dialog and page parity

The dialog and full page must render from the same project data.

Do not maintain separate project copy in Svelte and Astro.

### 26.4 Canonical behavior

The full project URL is canonical.

When a project is shown in a dialog over the homepage, do not dynamically mutate canonical tags. The underlying document remains the homepage. The address-bar change is navigational enhancement, not a new server document.

---

## 27. Testing strategy

### 27.1 Test layers

```text
Unit
├── contact validation
├── email sanitization
├── project navigation
├── slug uniqueness
├── service relationship validation
├── metadata helpers
└── structured-data helpers

Build/integration
├── expected static files
├── generated HTML metadata
├── static route coverage
├── 404 output
├── OG image output
└── contact endpoint contract

Browser/E2E
├── mobile menu
├── theme persistence
├── project dialog
├── history navigation
├── focus management
├── keyboard navigation
├── contact form
├── reduced motion
└── no-JavaScript fallbacks
```

### 27.2 Preserve existing unit tests first

Move pure modules before changing behavior.

The following logic should retain equivalent tests:

- `isValidEmail`;
- `coerceContactValues`;
- `validateContact`;
- email header sanitization;
- email HTML escaping;
- project previous/next navigation;
- environment validation.

### 27.3 Replace Express server tests

The current server tests boot Express and fetch routes.

Replace them with:

- tests against `astro build` output for static pages;
- tests against `astro preview` for route status and headers;
- direct handler tests for `/api/contact`;
- Playwright for browser interactions.

### 27.4 Metadata assertions

For `/`, `/services`, every service, every project, and `/404` assert:

- title;
- description;
- canonical presence or absence;
- robots;
- OG image;
- OG dimensions;
- Twitter metadata;
- parseable JSON-LD;
- unique `<h1>`;
- correct language.

### 27.5 Contact endpoint tests

Test:

- valid form-encoded submission;
- valid JSON submission if supported;
- invalid name;
- invalid email;
- invalid message;
- missing body;
- oversized body;
- unsupported content type;
- honeypot fake success;
- mismatched origin;
- prefix-attack referrer;
- malformed referrer;
- matching production origin;
- preview-origin policy;
- rate-limit result;
- Resend success;
- Resend failure;
- no API key in development;
- no recipient;
- no-JavaScript HTML response;
- JSON response;
- unsupported method.

### 27.6 E2E accessibility tests

At minimum:

- Tab through header;
- open and close mobile menu;
- open project dialog;
- verify focus enters;
- verify focus cannot escape;
- close with Escape;
- verify focus returns;
- navigate projects with arrows;
- use browser Back;
- submit invalid form;
- verify errors are associated with fields;
- submit valid form with mocked endpoint;
- toggle theme;
- reload and verify persistence.

Optional but recommended:

- `@axe-core/playwright` scans on representative pages.

### 27.7 Visual regression

Capture representative screenshots:

- homepage desktop light;
- homepage desktop dark;
- homepage mobile;
- service index;
- service detail;
- project dialog;
- project detail;
- contact errors;
- 404.

Use visual regression to catch accidental Pug-to-Astro markup drift.

### 27.8 Performance budgets

Establish before migration using current production or local preview.

Suggested budgets:

- no increase in homepage JavaScript without justification;
- only one framework runtime;
- no Svelte hydration above the selected-work interaction requirement;
- no layout shift from theme or fonts;
- no regression in LCP, CLS, or INP;
- no uncompressed hero image regression;
- no duplicate Motion payload and no remaining GSAP payload;
- no HTMX payload after cleanup.

Do not treat Lighthouse's single-run score as the only metric.

---

## 28. Script and command changes

Suggested scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "sync": "astro sync",
    "typecheck": "astro check",
    "test": "node --test",
    "test:e2e": "playwright test",
    "test:e2e:update": "playwright test --update-snapshots",
    "lint": "biome check .",
    "fix": "biome check --write .",
    "format": "biome format --write .",
    "verify": "pnpm run sync && pnpm run typecheck && pnpm run test && pnpm run lint && pnpm run build && pnpm run test:e2e"
  }
}
```

The exact test command depends on the chosen TypeScript execution path.

Keep local verification practical. If full Playwright makes every pre-push excessively slow, use:

```text
pre-push: typecheck + unit tests + lint + build
CI: full verify + Playwright
```

---

## 29. CI migration

Update `.github/workflows/verify.yml` while preserving:

- pinned action SHAs;
- `.nvmrc`;
- pnpm cache;
- frozen lockfile;
- least-privilege permissions.

Add:

- Astro type generation/check;
- Playwright browser installation;
- production build;
- E2E tests against preview or a locally started server;
- uploaded Playwright report on failure;
- optional built-output artifact for inspection.

Suggested job structure:

```text
quality
├── install
├── astro sync
├── astro check
├── unit tests
└── biome

build-and-e2e
├── install
├── playwright install chromium
├── astro build
├── start preview
└── playwright test
```

A single job is simpler initially. Split only when runtime or debugging makes it useful.

---

## 30. Vercel migration

### 30.1 Remove custom catch-all routing

The current `vercel.json` routes every non-file request to `api/index.ts`.

After Astro adapter integration:

- remove `api/index.ts`;
- remove Express-specific `includeFiles`;
- remove catch-all routes;
- let the Astro adapter generate deployment output;
- retain only headers and explicit redirects that Astro/Vercel cannot express cleanly elsewhere.

### 30.2 Build settings

Expected:

```text
Install command: pnpm install --frozen-lockfile
Build command: pnpm build
Output: managed by Astro/Vercel integration
Node: 24.x
```

### 30.3 Preview validation

Before production cutover, verify on a Vercel preview:

- every route;
- 404 status;
- contact endpoint;
- environment variables;
- email delivery policy;
- client IP extraction;
- security headers;
- CSP;
- Analytics;
- Speed Insights;
- static asset caching;
- project-dialog history;
- no mixed content;
- canonical URLs still point to production, not preview.

### 30.4 Production cutover

Use a normal merge to `main` only after preview approval.

Do not change DNS for an in-place Vercel project migration unless a separate project is intentionally used.

If using a separate Vercel project:

1. deploy preview;
2. attach a temporary test domain;
3. validate;
4. copy environment variables;
5. confirm Resend domain configuration;
6. lower DNS TTL in advance if DNS will move;
7. cut over;
8. keep the old deployment available for rollback;
9. monitor forms, errors, and analytics.

---

## 31. Migration phases

## Phase 0 — Baseline and freeze

### Tasks

- [ ] Create branch `migration/astro-svelte`.
- [ ] Record the current production URL and deployment ID.
- [ ] Run `pnpm verify` on the current branch.
- [ ] Capture current route status and metadata.
- [ ] Capture desktop/mobile screenshots in light and dark mode.
- [ ] Record current JS and CSS transfer sizes.
- [ ] Record Lighthouse/WebPageTest results.
- [ ] Export or document current Vercel environment variables.
- [ ] Document current security headers.
- [ ] Verify current contact delivery.
- [ ] Freeze visual and copy changes until parity checkpoint.

### Deliverables

- baseline report;
- screenshot set;
- route inventory;
- current package-lock state;
- rollback deployment reference.

### Exit criteria

- current `main` is green;
- baseline artifacts exist;
- no unrelated redesign work is entering the migration branch.

### Rollback

No production effect.

---

## Phase 1 — Astro foundation

### Tasks

- [ ] Add Astro, Svelte, Vercel, sitemap, Tailwind Vite, and Astro check dependencies.
- [ ] Create `astro.config.ts`.
- [ ] Create `svelte.config.js`.
- [ ] replace `tsconfig.json` with Astro strict configuration.
- [ ] Create a minimal `BaseLayout.astro`.
- [ ] Move global CSS into the Astro build.
- [ ] Confirm Tailwind class detection in `.astro` and `.svelte`.
- [ ] Preserve static public assets.
- [ ] Add temporary `/migration-smoke` page if useful.
- [ ] Keep Express files temporarily for reference; do not delete yet.

### Exit criteria

- `astro dev` runs;
- Tailwind builds;
- Svelte hydration works in a temporary smoke component;
- static assets resolve;
- `astro check` passes;
- no production deployment has changed.

### Rollback

Remove new scaffold files and restore package/lockfile.

---

## Phase 2 — Base layout and static shell

### Tasks

- [ ] Port `layout.pug` to `BaseLayout.astro`.
- [ ] Port global metadata.
- [ ] Port favicon and manifest links.
- [ ] Port font preloads.
- [ ] implement theme initializer.
- [ ] implement static-compatible CSP strategy.
- [ ] Port analytics using current supported integration.
- [ ] Add structured-data component/helper.
- [ ] Create `404.astro`.
- [ ] Add metadata tests.

### Exit criteria

- a static Astro page emits expected head metadata;
- theme does not flash under normal and throttled tests;
- CSP has no unexplained violations;
- 404 page renders with no canonical;
- generated HTML validates.

### Rollback

Astro branch only; Express remains intact.

---

## Phase 3 — Homepage parity and Motion migration

### Tasks

- [ ] Port header.
- [ ] Port hero.
- [ ] Port marquee.
- [ ] Port selected work as normal project links.
- [ ] Port services section.
- [ ] Port about.
- [ ] Port testimonials.
- [ ] Port FAQ.
- [ ] Port contact section as static HTML.
- [ ] Port footer.
- [ ] Port scroll-to-top.
- [ ] Preserve all IDs and anchors.
- [ ] Port basic page scripts.
- [ ] Add Motion through the Vite dependency graph.
- [ ] Migrate reveal-on-scroll to `inView()` and `animate()`.
- [ ] Migrate magnetic tilt to Motion values and springs.
- [ ] Migrate statistic count-up to direct number animation.
- [ ] Defer dialog-content stagger until `ProjectDialog.svelte` exists.
- [ ] Remove GSAP from homepage script loading after Motion parity is proven.
- [ ] Compare screenshots at agreed viewports.
- [ ] Test JavaScript-disabled page.

### Exit criteria

- homepage visual and animation parity approved;
- no GSAP script is loaded by the Astro homepage;
- Motion failure leaves all content visible;
- all links work;
- all content is present in static HTML;
- no modal dependency blocks project navigation;
- no contact enhancement is required for form fields to render;
- JavaScript payload is measured.

### Rollback

Express remains untouched and deployable.

---

## Phase 4 — Services routes

### Tasks

- [ ] Create `/services/index.astro`.
- [ ] Create `/services/[slug].astro`.
- [ ] Add `getStaticPaths()`.
- [ ] Add service types and validation.
- [ ] Port service components.
- [ ] Port related-service logic.
- [ ] Port service JSON-LD.
- [ ] Verify unknown slugs return 404.
- [ ] Compare every generated route with current metadata/content.

### Exit criteria

- every service route is generated;
- duplicate/broken slugs fail tests;
- metadata is correct;
- related links resolve;
- unknown routes return 404;
- pages work without JavaScript.

### Rollback

Remove static service route files; Express version remains available.

---

## Phase 5 — Project pages and Svelte dialog

### Tasks

- [ ] Add stable project slugs.
- [ ] Create `/projects/[slug].astro`.
- [ ] Create shared project detail renderer.
- [ ] Create `ProjectDialog.svelte`.
- [ ] Ensure cards remain normal links.
- [ ] Add dialog interception after hydration.
- [ ] implement focus trap/return.
- [ ] implement inert background.
- [ ] implement Escape and arrow navigation.
- [ ] implement URL/history behavior.
- [ ] implement reduced-motion behavior.
- [ ] migrate project-content stagger from the HTMX/GSAP hook to Motion inside the Svelte lifecycle.
- [ ] cancel stale dialog animations during rapid navigation and teardown.
- [ ] add legacy ID compatibility.
- [ ] remove dependence on HTMX fragments.
- [ ] add E2E tests.

### Exit criteria

- project pages are indexable;
- no-JS navigation works;
- dialog behavior passes keyboard tests;
- Back/Forward works;
- focus returns correctly;
- the old fragment endpoint is no longer used by the new frontend.

### Rollback

Disable island enhancement and leave normal project pages/links functional.

---

## Phase 6 — Contact endpoint

### Tasks

- [ ] Move validation helpers.
- [ ] Move email helper.
- [ ] Add server environment validation.
- [ ] Create `/api/contact`.
- [ ] Add form-encoded parser.
- [ ] Add optional JSON parser.
- [ ] Add body-size enforcement.
- [ ] Add origin/referrer protection.
- [ ] Add honeypot behavior.
- [ ] Add rate-limiter interface and production adapter.
- [ ] Add normalized responses.
- [ ] Add no-JS HTML response.
- [ ] Add contact enhancement script.
- [ ] Add accessible status announcements.
- [ ] Add endpoint and E2E tests.
- [ ] Test preview email policy.
- [ ] Temporarily support legacy `/contact` if required.

### Exit criteria

- all contact tests pass;
- real preview submission follows intended delivery policy;
- no secrets leak;
- invalid input preserves values;
- rate-limit behavior is documented;
- no-JS submission gets a human-readable document.

### Rollback

Keep Express contact endpoint deployed until the Astro endpoint is verified, or route the form back to the legacy endpoint during the branch preview.

---

## Phase 7 — OG, SEO, headers, and deployment parity

### Tasks

- [ ] Convert OG route to static endpoint.
- [ ] Add sitemap.
- [ ] Add robots policy.
- [ ] finalize security headers.
- [ ] enforce CSP after report-only testing.
- [ ] verify Vercel Analytics.
- [ ] verify Speed Insights.
- [ ] verify canonical URLs.
- [ ] verify JSON-LD.
- [ ] verify static caching.
- [ ] remove custom Vercel catch-all.
- [ ] deploy full preview.

### Exit criteria

- OG image valid;
- sitemap includes intended pages;
- no private/API routes in sitemap;
- 404 status correct;
- CSP enforced without functional breakage;
- analytics present once;
- static pages served from CDN;
- only contact endpoint is dynamic.

### Rollback

Revert Vercel configuration and redeploy the previous production commit.

---

## Phase 8 — Test and quality-gate replacement

### Tasks

- [ ] Move pure unit tests.
- [ ] Replace Express route tests.
- [ ] add build-output tests.
- [ ] add Playwright.
- [ ] add accessibility checks.
- [ ] add visual snapshots.
- [ ] update `verify`.
- [ ] update pre-push hook.
- [ ] update GitHub Actions.
- [ ] test clean install from frozen lockfile.
- [ ] test build on Node 24.

### Exit criteria

- CI green from a clean checkout;
- tests cover parity-critical behavior;
- reports are useful on failure;
- no test sends real email;
- full verification is documented.

---

## Phase 9 — Cleanup

Do not start cleanup until the Astro preview is approved.

### Remove

- [ ] `src/server.ts`
- [ ] Pug views
- [ ] `api/index.ts`
- [ ] Express dependencies
- [ ] Helmet
- [ ] HTMX dependency and vendored file
- [ ] Express rate-limit dependency
- [ ] Tailwind CLI dependency
- [ ] obsolete vendor-sync logic, including GSAP vendoring
- [ ] obsolete compiled `dist/server.js` assumptions
- [ ] obsolete test configuration
- [ ] old server comments and README instructions
- [ ] old Vercel catch-all configuration

### Verify after deletion

- [ ] no import references remain;
- [ ] no old public JS is loaded;
- [ ] no HTMX attributes remain;
- [ ] no Pug path is referenced;
- [ ] no Express environment option remains undocumented;
- [ ] lockfile reflects removals;
- [ ] final build is smaller or justified;
- [ ] all tests still pass.

---

## Phase 10 — Production release

### Pre-release checklist

- [ ] Preview approved visually.
- [ ] Preview approved functionally.
- [ ] Contact delivery verified.
- [ ] CSP enforced.
- [ ] Route matrix verified.
- [ ] 404 status verified.
- [ ] sitemap verified.
- [ ] analytics verified.
- [ ] production environment variables reviewed.
- [ ] rollback commit/deployment identified.
- [ ] no unrelated changes included.
- [ ] release notes prepared.

### Release

- [ ] Merge migration PR.
- [ ] Observe Vercel production build.
- [ ] Verify homepage.
- [ ] Verify one service page.
- [ ] Verify one project page.
- [ ] Verify project dialog.
- [ ] Submit one controlled contact message.
- [ ] Verify email arrival.
- [ ] Verify logs contain no unexpected errors.
- [ ] Verify Analytics and Speed Insights.
- [ ] Verify response headers.
- [ ] Verify search-engine-facing metadata.

### Post-release monitoring

For the first production observation window, watch:

- server function errors;
- contact delivery failures;
- 403 and 429 rates;
- unexpected 404s;
- CSP violations;
- client exceptions;
- Core Web Vitals;
- analytics drop or duplication;
- broken project history behavior.

---

## 32. Pull-request strategy

Use small, reviewable commits or stacked PRs.

Recommended sequence:

```text
PR 1  chore: scaffold Astro, Svelte, Vercel, and Tailwind
PR 2  feat: port base layout, metadata, theme, and security shell
PR 3  feat: port homepage and migrate animation behavior to Motion
PR 4  feat: generate service routes
PR 5  feat: add project pages and Svelte dialog
PR 6  feat: migrate contact endpoint and form enhancement
PR 7  test: replace route tests and add Playwright coverage
PR 8  chore: switch Vercel output and remove legacy stack
```

If maintaining two frameworks in `main` between PRs would complicate deployment, keep the work in one long-lived migration branch but preserve the same commit boundaries.

Commit rules:

- one concern per commit;
- no formatting-only churn mixed with behavioral changes;
- generated lockfile changes committed with package changes;
- no dependency upgrades unrelated to the migration;
- no old-stack deletion before replacement tests exist.

---

## 33. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Visual drift during Pug conversion | Medium | Medium | Screenshot baseline and visual regression |
| Static CSP breaks hydration/analytics | Medium | High | Report-only preview, inspect built output, narrow hashes/sources |
| Theme flashes after removing nonce script | Medium | Medium | Blocking same-origin initializer or hash-based inline script |
| Contact endpoint loses anti-abuse behavior | Medium | High | Port pure logic first; exhaustive endpoint tests |
| Serverless rate limiting is ineffective | High in current pattern | Medium | Shared limiter or platform firewall; document semantics |
| Project dialog breaks browser history | Medium | Medium | Explicit state model and Playwright Back/Forward tests |
| Svelte island increases JS excessively | Low | Medium | One island, measure bundle, no whole-page hydration |
| Motion initializes twice, leaves active controls, or leaks subscriptions | Medium | Medium | One initialization path; track controls/effects and test cleanup |
| Unknown service routes return 200 | Low | High for SEO | Preview status tests and Vercel verification |
| Canonical URLs use preview origin | Medium | High for SEO | `site` fixed to production origin; metadata tests |
| Email sends during CI/preview | Medium | High | injected sender, delivery gate, preview policy |
| OG image build cannot find fonts | Medium | Medium | local build-safe font loading and tests |
| Tailwind misses dynamic classes | Medium | Medium | avoid class construction; source detection tests |
| Analytics duplicates events | Low | Medium | use one official integration; inspect network calls |
| Static project pages expose inconsistent copy | Low | Medium | shared data source for dialog and page |
| Cleanup removes required legacy route too soon | Medium | Medium | temporary compatibility handler and log validation |
| Migration becomes a redesign | High | High for schedule | parity freeze and explicit non-goals |

---

## 34. Rollback plan

### 34.1 Before production

No special rollback is required. The current Express deployment remains the reference.

### 34.2 In-place production deployment

Rollback steps:

1. identify the last known-good Express production deployment;
2. use Vercel rollback or redeploy the previous commit;
3. verify `/`, one service route, `/contact`, and `/og-image.png`;
4. submit a controlled contact message;
5. confirm headers and analytics;
6. open an incident issue with the failed Astro deployment and evidence.

### 34.3 Data compatibility

There is no database migration, so rollback does not require data reversal.

Environment variable additions should be backward compatible. Do not rename or delete existing Resend variables until the Astro release has remained stable.

### 34.4 DNS rollback

If the same Vercel project and domain are used, DNS rollback is not needed.

If using a separate project/domain cutover, keep the old project deployable and document exact domain reassignment steps before launch.

---

## 35. Definition of done

The migration is complete only when all of the following are true.

### Architecture

- [ ] Astro is the page and build framework.
- [ ] All content pages are prerendered.
- [ ] Only the contact endpoint is on-demand.
- [ ] Svelte is used only for the project dialog or another explicitly justified island.
- [ ] React is absent.
- [ ] Express, Pug, and HTMX are absent.
- [ ] GSAP and the vendored GSAP runtime are absent.
- [ ] Motion is the only animation library.
- [ ] No custom catch-all server function remains.

### Functionality

- [ ] All current homepage sections work.
- [ ] All services resolve.
- [ ] All projects have real routes.
- [ ] Project dialog works after hydration.
- [ ] Project links work without JavaScript.
- [ ] Contact form works with enhancement.
- [ ] Contact form has a no-JavaScript fallback.
- [ ] Theme persists.
- [ ] Mobile menu works.
- [ ] Scroll-to-top works.
- [ ] Motion animations reproduce the approved behavior and respect reduced motion.

### SEO

- [ ] Titles and descriptions are correct.
- [ ] Canonicals are correct.
- [ ] 404 pages have no canonical.
- [ ] Robots directives are correct.
- [ ] JSON-LD parses.
- [ ] OG image works.
- [ ] sitemap includes all intended pages.
- [ ] legacy URLs redirect or remain supported.
- [ ] production origin is never replaced by preview origin.

### Security

- [ ] CSP is enforced.
- [ ] no `'unsafe-inline'` or `'unsafe-eval'` was introduced without documented necessity.
- [ ] security headers are present.
- [ ] origin/referrer checks pass adversarial tests.
- [ ] body size is limited.
- [ ] honeypot behavior is preserved.
- [ ] rate-limit semantics are real and documented.
- [ ] email headers are sanitized.
- [ ] email HTML is escaped.
- [ ] secrets remain server-only.
- [ ] logs do not contain submitted messages.

### Quality

- [ ] `pnpm install --frozen-lockfile` passes.
- [ ] `pnpm verify` passes.
- [ ] Astro check passes.
- [ ] unit tests pass.
- [ ] build tests pass.
- [ ] Playwright passes.
- [ ] visual and animation regressions are approved.
- [ ] accessibility checks pass.
- [ ] Node 24 build passes in CI.
- [ ] Vercel preview passes production-like validation.

### Documentation

- [ ] README describes the Astro architecture.
- [ ] environment variables are documented.
- [ ] contact rate limiting is documented.
- [ ] preview email behavior is documented.
- [ ] local development commands are correct.
- [ ] deployment behavior is correct.
- [ ] security-header maintenance is documented.
- [ ] dependency-vendoring instructions are removed if no longer relevant.
- [ ] Motion ownership, reduced-motion behavior, and cleanup rules are documented.

---

## 36. Recommended implementation order inside files

For the lowest-risk path, move code in this order:

1. `src/contact.ts` pure validation;
2. `src/projects-nav.ts` pure navigation;
3. `src/email.ts` with environment import adapted;
4. `src/data/projects.ts`;
5. `src/data/site.ts`;
6. global CSS and static assets;
7. base layout and metadata;
8. 404;
9. homepage static markup;
10. services routes;
11. project pages;
12. project dialog;
13. basic client scripts;
14. Motion animation migration;
15. contact endpoint;
16. OG endpoint;
17. security headers;
18. analytics;
19. deployment configuration;
20. delete the legacy stack.

This order creates working, testable layers and delays irreversible cleanup.

---

## 37. Post-migration improvements

These are not required for the first Astro production release.

### Recommended

- move full project case studies to Astro content collections;
- add a richer `Project` schema;
- add per-project OG images;
- use Astro image optimization after measuring current assets;
- add automated broken-link checking;
- add HTML validation;
- add bundle-size reporting;
- add CSP hash verification automation;
- add durable rate limiting if the first release used platform-level protection;
- add structured logging for contact delivery;
- add an error-monitoring product only if operational value justifies it.

### Deliberately optional

- Astro View Transitions;
- contact form as a Svelte island;
- content editing UI;
- CMS;
- server islands;
- Astro Actions;
- MDX;
- page-level animation orchestration.

Each should be adopted only for a concrete product requirement.

---

## 38. Official implementation references

- Astro on-demand rendering: <https://docs.astro.build/en/guides/on-demand-rendering/>
- Astro endpoints: <https://docs.astro.build/en/guides/endpoints/>
- Astro Svelte integration: <https://docs.astro.build/en/guides/integrations-guide/svelte/>
- Astro Vercel adapter: <https://docs.astro.build/en/guides/integrations-guide/vercel/>
- Astro styling: <https://docs.astro.build/en/guides/styling/>
- Tailwind CSS with Astro: <https://tailwindcss.com/docs/installation/framework-guides/astro>
- Motion animate: <https://motion.dev/docs/animate>
- Motion inView: <https://motion.dev/docs/inview>
- Motion values: <https://motion.dev/docs/motion-value>

---

## 39. Final recommendation

Treat this as a **parity-first migration followed by selective improvement**.

The right end state is not “the same Express application rewritten in Astro syntax.” It is:

- static documents for static content;
- one narrow request-time endpoint;
- normal links before hydration;
- one Svelte island for genuinely stateful interaction;
- Motion for framework-neutral animation without forcing Astro-owned markup into Svelte;
- typed content and server modules;
- platform-level deployment instead of a catch-all Express function;
- a security policy designed for static output rather than copied from a dynamic renderer.

The current implementation is good enough that a careless rewrite could make it worse. The migration should earn its existence through a smaller runtime surface, clearer component authoring, better project URLs, stronger progressive enhancement, and simpler deployment—not merely newer package names.
