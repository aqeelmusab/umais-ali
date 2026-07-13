import type { Project } from '../../data/projects'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, socialLinks } from '../../data/site'

export interface BreadcrumbItem {
  name: string
  item: string
}

export function createSiteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ['umaisali.com'],
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
}

export function createServiceGraph(service: {
  title: string
  slug: string
  metaDescription: string
}) {
  const base = createSiteGraph()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base['@graph'],
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
}

export function createProjectGraph(project: Project) {
  const base = createSiteGraph()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base['@graph'],
      {
        '@type': 'CreativeWork',
        '@id': `${SITE_URL}/projects/${project.slug}#creativework`,
        name: project.title,
        headline: project.title,
        description: project.description,
        creator: { '@id': `${SITE_URL}/#person` },
        url: `${SITE_URL}/projects/${project.slug}`,
        datePublished: project.year,
        genre: project.category,
      },
    ],
  }
}
