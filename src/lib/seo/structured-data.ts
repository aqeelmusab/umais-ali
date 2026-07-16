import type { Project } from '../../data/projects'
import { faqs, SITE_DESCRIPTION, SITE_NAME, SITE_URL, socialLinks } from '../../data/site'

export interface BreadcrumbItem {
  name: string
  item: string
}

function createBreadcrumbList(id: string, items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  }
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
        name: SITE_NAME,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        mainEntity: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
    ],
  }
}

export function createHomeGraph() {
  const base = createSiteGraph()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base['@graph'],
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
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
      createBreadcrumbList(`${SITE_URL}/services/${service.slug}#breadcrumb`, [
        { name: 'Home', item: SITE_URL },
        { name: 'Services', item: `${SITE_URL}/services` },
        { name: service.title, item: `${SITE_URL}/services/${service.slug}` },
      ]),
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
        image: `${SITE_URL}${project.image.src}`,
        creator: { '@id': `${SITE_URL}/#person` },
        url: `${SITE_URL}/projects/${project.slug}`,
        datePublished: project.year,
        genre: project.category,
      },
      createBreadcrumbList(`${SITE_URL}/projects/${project.slug}#breadcrumb`, [
        { name: 'Home', item: SITE_URL },
        { name: project.title, item: `${SITE_URL}/projects/${project.slug}` },
      ]),
    ],
  }
}
