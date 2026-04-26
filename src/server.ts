import path from 'node:path'
import express, { type Express, type Request, type Response } from 'express'
import helmet from 'helmet'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import { projects } from './data/projects'
import { validateContact } from './contact'
import { sendContactEmail } from './email'
import { env, isProduction, isTest, assertProductionEnv } from './env'
import { getProjectNavigation } from './projects-nav'
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  experience,
  faqs,
  heroStats,
  highlights,
  marquee,
  navLinks,
  services,
  skills,
  socialLinks,
  testimonials,
} from './data/site'

// Resolve views/public relative to project root (works for both `tsx` and compiled `dist`).
const ROOT = path.resolve(__dirname, '..')

export function createApp(): Express {
  const app = express()

  // Trust Vercel's proxy headers so req.ip and rate limiting see the real client IP.
  const trust = env.TRUST_PROXY
  app.set('trust proxy', /^\d+$/.test(trust) ? Number(trust) : trust)

  app.set('view engine', 'pug')
  app.set('views', path.join(ROOT, 'src', 'views'))
  app.disable('x-powered-by')

  // Security headers. CSP is left off because the layout uses inline scripts/styles
  // and the unpkg HTMX CDN; tighten this once those are inventoried.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: env.ENABLE_HSTS && isProduction
        ? { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true, preload: true }
        : false,
    }),
  )

  // Static assets (images, css, htmx, app.js)
  app.use(express.static(path.join(ROOT, 'public'), { maxAge: '1h', etag: true }))

  // Form-encoded body parser for the contact form
  app.use(express.urlencoded({ extended: false, limit: '32kb' }))

  // Per-IP rate limit for the contact endpoint. Disabled in tests.
  const contactLimiter = rateLimit({
    windowMs: env.CONTACT_RATE_WINDOW_MS,
    limit: env.CONTACT_RATE_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => isTest,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
    handler: (_req, res) => {
      res.status(429).render('partials/contact-form', {
        values: { name: '', email: '', message: '' },
        errors: { message: 'Too many requests. Please try again in a few minutes.' },
      })
    },
  })

  const baseLocals = {
    site: {
      url: SITE_URL,
      name: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      contactEmail: CONTACT_EMAIL,
    },
    navLinks,
    heroStats,
    skills,
    experience,
    highlights,
    services,
    marquee,
    testimonials,
    faqs,
    socialLinks,
    projects,
    year: new Date().getFullYear(),
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Umais Ali',
        url: SITE_URL,
        jobTitle: 'SEO Executive',
        description:
          'SEO strategist and operator with five plus years of experience helping businesses build organic search channels that hold up after launch.',
        knowsAbout: [
          'Search Engine Optimization',
          'Technical SEO',
          'Content Strategy',
          'Keyword Research',
          'Link Building',
          'Google Analytics',
          'Google Search Console',
          'SEO Audits',
          'Site Migration',
          'Core Web Vitals',
        ],
        sameAs: socialLinks.map((l) => l.href),
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: SITE_TITLE,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        mainEntity: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
    ],
  }

  app.get('/', (_req: Request, res: Response) => {
    res.render('index', { ...baseLocals, jsonLd })
  })

  // HTMX: return a single project's modal markup for inline injection.
  app.get('/projects/:id', (req: Request, res: Response) => {
    const nav = getProjectNavigation(projects, Number(req.params.id))
    if (!nav) {
      res.status(404).send('Project not found')
      return
    }
    res.render('partials/project-modal-content', nav)
  })

  app.post('/contact', contactLimiter, async (req: Request, res: Response) => {
    const result = validateContact(req.body)

    // Silently accept honeypot hits to avoid signaling bots.
    if (result.honeypot) {
      res.render('partials/contact-success', { name: result.values.name || 'there' })
      return
    }

    if (!result.ok) {
      res.status(422).render('partials/contact-form', {
        values: result.values,
        errors: result.errors,
      })
      return
    }

    const ip = req.ip
    const userAgent = req.get('user-agent') ?? ''

    const sent = await sendContactEmail({
      values: result.values,
      ip,
      userAgent,
    })

    if (sent.delivered) {
      console.log('[contact] delivered via Resend', { id: sent.id, email: result.values.email })
    } else if (sent.skipped) {
      console.log('[contact] email skipped', {
        reason: sent.skipped,
        name: result.values.name,
        email: result.values.email,
      })
    } else {
      // Don't leak the failure to the user — they did their part — but log loudly.
      console.error('[contact] Resend send failed', {
        error: sent.error,
        email: result.values.email,
      })
    }

    res.render('partials/contact-success', { name: result.values.name })
  })

  // 404 fallback
  app.use((_req: Request, res: Response) => {
    res.status(404).render('404', baseLocals)
  })

  return app
}

// Only start the HTTP server when this file is the entrypoint (not under test).
if (require.main === module) {
  assertProductionEnv()
  createApp().listen(env.PORT, () => {
    console.log(`▸ umais-ali listening on http://localhost:${env.PORT}`)
  })
}
