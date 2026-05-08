import { randomBytes } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import express, { type Express, type Request, type Response } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { validateContact } from './contact'
import { projects } from './data/projects'
import {
  CONTACT_EMAIL,
  experience,
  faqs,
  getServiceBySlug,
  heroStats,
  highlights,
  marquee,
  navLinks,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  services,
  skills,
  socialLinks,
  testimonials,
} from './data/site'
import { type SendContactArgs, type SendContactResult, sendContactEmail } from './email'
import { assertProductionEnv, env, isProduction, isTest } from './env'
import { ogImageHandler } from './og-image.js'
import { getProjectNavigation } from './projects-nav'

// Resolve views/public relative to project root (works for both `tsx` and compiled `dist`).
const ROOT = path.resolve(__dirname, '..')

type ContactEmailSender = (args: SendContactArgs) => Promise<SendContactResult>

export interface CreateAppOptions {
  sendEmail?: ContactEmailSender
  enableVercelInsights?: boolean
  csrfProtection?: boolean
}

export function createApp(options: CreateAppOptions = {}): Express {
  const sendEmail = options.sendEmail ?? sendContactEmail
  const enableVercelInsights = options.enableVercelInsights ?? isProduction
  const csrfEnabled = options.csrfProtection ?? isProduction
  const app = express()

  // Trust Vercel's proxy headers so req.ip and rate limiting see the real client IP.
  const trust = env.TRUST_PROXY
  app.set('trust proxy', /^\d+$/.test(trust) ? Number(trust) : trust)

  app.set('view engine', 'pug')
  app.set('views', path.join(ROOT, 'src', 'views'))
  app.disable('x-powered-by')

  app.use((_req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('base64')
    next()
  })

  const cspNonce = (_req: IncomingMessage, res: ServerResponse): string =>
    `'nonce-${(res as Response).locals.cspNonce}'`

  // Security headers. Inline scripts are allowed only with the per-request nonce.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", cspNonce, 'https://unpkg.com/htmx.org@2.0.4'],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'"],
          styleSrcAttr: ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts:
        env.ENABLE_HSTS && isProduction
          ? { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true, preload: true }
          : false,
    }),
  )

  // Static assets (images, css, htmx, site-main.js)
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
    keyGenerator: (req) => {
      const fromProxy = typeof req.ip === 'string' ? req.ip.trim() : ''
      const fallback = req.socket?.remoteAddress?.trim() ?? ''
      const key = fromProxy || fallback || 'unknown-client'
      return ipKeyGenerator(key)
    },
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
    enableVercelInsights,
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
          'SEO strategist and executor with five plus years of experience helping businesses build organic search channels that hold up after launch.',
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

  // Dynamically generated Open Graph image (rendered with Satori + resvg-js).
  app.get('/og-image.png', ogImageHandler)

  app.get('/', (_req: Request, res: Response) => {
    res.render('index', { ...baseLocals, canonicalPath: '/', jsonLd })
  })

  app.get('/services', (_req: Request, res: Response) => {
    res.render('services', {
      ...baseLocals,
      title: 'SEO Services | Umais Ali',
      description:
        'SEO services for teams that need technical audits, content strategy, programmatic SEO, link building, migrations, and reporting that turns search into a real growth channel.',
      canonicalPath: '/services',
      jsonLd,
    })
  })

  app.get('/services/:slug', (req: Request, res: Response) => {
    const slugParam = req.params.slug
    const serviceSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam
    const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined
    if (!service) {
      res.status(404).render('404', {
        ...baseLocals,
        title: 'Page Not Found | Umais Ali',
        description: 'The page you requested could not be found.',
        robots: 'noindex, nofollow',
      })
      return
    }

    const relatedServices = services.filter((candidate) =>
      service.relatedSlugs.includes(candidate.slug),
    )

    const serviceJsonLd = {
      ...jsonLd,
      '@graph': [
        ...jsonLd['@graph'],
        {
          '@type': 'Service',
          '@id': `${SITE_URL}/services/${service.slug}#service`,
          name: service.title,
          description: service.metaDescription,
          provider: { '@id': `${SITE_URL}/#person` },
          url: `${SITE_URL}/services/${service.slug}`,
          areaServed: 'Worldwide',
        },
      ],
    }

    res.render('service-detail', {
      ...baseLocals,
      service,
      relatedServices,
      title: service.metaTitle,
      description: service.metaDescription,
      canonicalPath: `/services/${service.slug}`,
      jsonLd: serviceJsonLd,
    })
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

  app.get('/contact/form', (_req: Request, res: Response) => {
    res.render('partials/contact-form', {
      values: { name: '', email: '', message: '' },
      errors: {},
    })
  })

  app.post('/contact', contactLimiter, async (req: Request, res: Response) => {
    // Stateless CSRF protection: verify Origin or Referer matches SITE_URL in production
    if (csrfEnabled) {
      const origin = req.get('origin')
      const referer = req.get('referer')
      const expectedOrigin = new URL(SITE_URL).origin
      if (origin && origin !== expectedOrigin) {
        res.status(403).send('Forbidden: Invalid Origin')
        return
      }
      if (!origin && referer && !referer.startsWith(expectedOrigin)) {
        res.status(403).send('Forbidden: Invalid Referer')
        return
      }
    }

    const result = validateContact(req.body)

    // Silently accept honeypot hits to avoid signaling bots.
    if (result.honeypot) {
      res.render('partials/contact-send-success', { name: result.values.name || 'there' })
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
    const userAgent = (req.get('user-agent') ?? '').slice(0, 500)

    const sent = await sendEmail({
      values: result.values,
      ip,
      userAgent,
    })

    if (sent.delivered) {
      console.log('[contact] delivered via Resend', { id: sent.id })
      res.render('partials/contact-send-success', { name: result.values.name })
      return
    }

    if (sent.skipped) {
      console.log('[contact] email skipped', {
        reason: sent.skipped,
      })
    } else {
      console.error('[contact] Resend send failed', {
        error: sent.error,
      })
    }

    res.render('partials/contact-send-failure', {
      contactEmail: CONTACT_EMAIL,
    })
  })

  // 404 fallback
  app.use((_req: Request, res: Response) => {
    res.status(404).render('404', {
      ...baseLocals,
      title: 'Page Not Found | Umais Ali',
      description: 'The page you requested could not be found.',
      robots: 'noindex, nofollow',
    })
  })

  return app
}

let serverlessApp: Express | null = null

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (!serverlessApp) {
    assertProductionEnv()
    serverlessApp = createApp()
  }
  serverlessApp(req, res)
}

// Only start the HTTP server when this file is the entrypoint (not under test).
if (require.main === module) {
  assertProductionEnv()
  createApp().listen(env.PORT, () => {
    console.log(`▸ umais-ali listening on http://localhost:${env.PORT}`)
  })
}
