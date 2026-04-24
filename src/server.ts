import path from 'node:path'
import express, { type Express, type Request, type Response } from 'express'
import { projects } from './data/projects'
import { validateContact } from './contact'
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

  app.set('view engine', 'pug')
  app.set('views', path.join(ROOT, 'src', 'views'))

  // Static assets (images, css, htmx, app.js)
  app.use(express.static(path.join(ROOT, 'public'), { maxAge: '1h', etag: true }))

  // Form-encoded body parser for the contact form
  app.use(express.urlencoded({ extended: false, limit: '32kb' }))

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

  app.post('/contact', (req: Request, res: Response) => {
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

    // In a real deployment this would dispatch via SMTP / a transactional API.
    // For now we log and respond with the success fragment HTMX will swap in.
    console.log('[contact] new message', {
      name: result.values.name,
      email: result.values.email,
      length: result.values.message.length,
    })

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
  const PORT = Number(process.env.PORT) || 3000
  createApp().listen(PORT, () => {
    console.log(`▸ umais-ali listening on http://localhost:${PORT}`)
  })
}
