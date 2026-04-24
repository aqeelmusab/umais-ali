import path from 'node:path'
import express, { type Request, type Response } from 'express'
import { projects } from './data/projects'
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  experience,
  heroStats,
  highlights,
  navLinks,
  skills,
  socialLinks,
} from './data/site'

const app = express()
const PORT = Number(process.env.PORT) || 3000

// Resolve views/public relative to project root (works for both `tsx` and compiled `dist`).
const ROOT = path.resolve(__dirname, '..')

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
        'SEO strategist and executor with 5+ years of experience helping businesses build organic search channels that compound over time.',
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
  const id = Number(req.params.id)
  const project = projects.find((p) => p.id === id)
  if (!project) {
    res.status(404).send('Project not found')
    return
  }
  const index = projects.findIndex((p) => p.id === id)
  res.render('partials/project-modal-content', {
    project,
    hasPrev: index > 0,
    hasNext: index < projects.length - 1,
    prevId: index > 0 ? projects[index - 1].id : null,
    nextId: index < projects.length - 1 ? projects[index + 1].id : null,
  })
})

// ── Contact form ────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactBody {
  name?: string
  email?: string
  message?: string
  // honeypot — bots typically fill all fields
  website?: string
}

app.post('/contact', (req: Request, res: Response) => {
  const body = req.body as ContactBody
  const name = (body.name ?? '').toString().trim()
  const email = (body.email ?? '').toString().trim()
  const message = (body.message ?? '').toString().trim()
  const honeypot = (body.website ?? '').toString().trim()

  // Silently accept honeypot hits to avoid signaling bots.
  if (honeypot.length > 0) {
    res.render('partials/contact-success', { name: name || 'there' })
    return
  }

  const errors: { name?: string; email?: string; message?: string } = {}
  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your name (2–80 characters).'
  if (!EMAIL_RE.test(email) || email.length > 200) errors.email = 'Please enter a valid email address.'
  if (message.length < 10 || message.length > 4000)
    errors.message = 'Please write a message between 10 and 4000 characters.'

  if (Object.keys(errors).length > 0) {
    res.status(422).render('partials/contact-form', {
      values: { name, email, message },
      errors,
    })
    return
  }

  // In a real deployment this would dispatch via SMTP / a transactional API.
  // For now we log and respond with the success fragment HTMX will swap in.
  console.log('[contact] new message', { name, email, length: message.length })

  res.render('partials/contact-success', { name })
})

// 404 fallback
app.use((_req: Request, res: Response) => {
  res.status(404).render('404', baseLocals)
})

app.listen(PORT, () => {
  console.log(`▸ umais-ali listening on http://localhost:${PORT}`)
})
