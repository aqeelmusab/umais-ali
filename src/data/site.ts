export const SITE_URL = 'https://umaisali.com'
export const SITE_NAME = 'Umais Ali'
export const SITE_TITLE = 'Umais Ali | SEO that actually moves the needle'
export const SITE_DESCRIPTION =
  'I help teams turn search into a real growth channel. Technical audits, content systems, link building, and migrations that hold up after launch. Five years in, forty something projects, three million plus organic visits.'

/** Section ids on the home page (hero, work, about, contact). */
export const homeSections = {
  top: 'top',
  work: 'work',
  about: 'about',
  contact: 'contact',
} as const

export type HomeSectionId = (typeof homeSections)[keyof typeof homeSections]

/** Link to a home section from any route (e.g. nav, 404). */
export function homeSectionHref(section: HomeSectionId): string {
  return `/#${section}`
}

/** Same-page section link (e.g. contact block at the bottom of /services). */
export function sectionHref(sectionId: string): string {
  return `#${sectionId}`
}

export const navLinks = [
  { label: 'Work', href: homeSectionHref('work') },
  { label: 'Services', href: '/services' },
  { label: 'About', href: homeSectionHref('about') },
  { label: 'Contact', href: homeSectionHref('contact') },
]

export const heroStats = [
  { value: '5+', label: 'Years doing this' },
  { value: '40+', label: 'Projects shipped' },
  { value: '3M+', label: 'Organic visits earned' },
]

export const skills = [
  'On-Page SEO',
  'Technical SEO',
  'Keyword Research',
  'Link Building',
  'Content Strategy',
  'Google Analytics',
  'Search Console',
  'SEO Audits',
  'Site Migration',
  'Schema Markup',
  'Core Web Vitals',
  'Programmatic SEO',
]

export const experience = [
  { period: '2023 to now', role: 'SEO Executive', company: 'Freelance' },
  { period: '2021 to 2023', role: 'SEO Specialist', company: 'Digital Starter' },
  { period: '2019 to 2021', role: 'Junior SEO Analyst', company: 'RankEdge Agency' },
]

export const highlights = [
  { value: '40+', label: 'Projects' },
  { value: '3M+', label: 'Organic visits' },
  { value: '200%', label: 'Avg. traffic lift' },
  { value: '50+', label: 'Page 1 keywords' },
]

export const services = [
  {
    number: '01',
    title: 'Technical SEO Audits',
    slug: 'technical-seo-audits',
    summary:
      'A real look at why your site is not ranking. Crawl issues, indexation, schema, Core Web Vitals. You get a short fix list ordered by impact, not a sixty page PDF nobody reads.',
    deliverables: ['Crawl and log analysis', 'Indexation map', 'CWV remediation'],
    metaTitle: 'Technical SEO Audits | Umais Ali',
    metaDescription:
      'Technical SEO audits for teams that need clear diagnosis, prioritized fixes, and cleaner crawl, indexation, schema, and Core Web Vitals performance.',
    hero: {
      eyebrow: 'Technical SEO Audits',
      lineOne: 'Find the blockers search engines',
      accent: 'keep running into.',
      intro:
        'I audit the parts of a site that quietly decide whether good pages get found, crawled, indexed, and trusted. The output is practical, prioritized, and written for the people who need to ship the fixes.',
    },
    overview: [
      'Most SEO problems do not announce themselves neatly. A page can look fine in a browser and still waste crawl budget, send mixed canonical signals, hide important templates from search, or load slowly enough to lose demand before it converts.',
      'This audit turns those issues into a clean working list. I separate urgent technical problems from cosmetic noise, explain the tradeoffs, and help your team move in the order that protects traffic and revenue.',
    ],
    bestFor: [
      'Sites with traffic drops or flat growth',
      'Teams preparing for a redesign or migration',
      'Marketing teams that need engineering-ready tickets',
    ],
    outcomes: [
      {
        title: 'Crawl clarity',
        text: 'A map of the pages search engines can reach, the pages they should ignore, and the loops or dead ends wasting crawl attention.',
      },
      {
        title: 'Indexation control',
        text: 'A clear view of what is indexed, what should be indexed, and where canonical, robots, sitemap, or rendering signals are getting in the way.',
      },
      {
        title: 'Fix order by impact',
        text: 'A short action plan that tells your team what to fix first, why it matters, who should own it, and how to verify the result.',
      },
    ],
    process: [
      {
        title: 'Baseline the site',
        text: 'I review analytics, Search Console, templates, sitemap coverage, crawl data, and recent release history before making recommendations.',
      },
      {
        title: 'Inspect the signals',
        text: 'I check rendering, internal links, canonicals, redirects, structured data, status codes, Core Web Vitals, and duplicate or thin page patterns.',
      },
      {
        title: 'Turn findings into work',
        text: 'You get prioritized tickets, acceptance criteria, and a walkthrough so marketing and engineering can move without guessing.',
      },
    ],
    scope: {
      timeline: '10 to 15 working days for most sites',
      format: 'Audit, fix list, implementation call, and follow-up review',
      handoff: 'A concise roadmap your team can actually work through',
    },
    relatedSlugs: ['seo-migrations', 'reporting-that-helps'],
  },
  {
    number: '02',
    title: 'Content and Keywords',
    slug: 'content-and-keywords',
    summary:
      'Topic clusters built around the things your buyers actually search for, mapped to pages on your site so the work compounds instead of fighting itself.',
    deliverables: ['Intent mapped keywords', 'Topic clusters', 'Editorial calendar'],
    metaTitle: 'Content and Keyword Strategy | Umais Ali',
    metaDescription:
      'Content and keyword strategy for teams that need search demand mapped into focused pages, topic clusters, and a realistic publishing plan.',
    hero: {
      eyebrow: 'Content and Keywords',
      lineOne: 'Build content around demand',
      accent: 'that is already there.',
      intro:
        'I turn search data into a content plan your team can publish with confidence. The work starts with buyer intent, not volume screenshots, and ends with pages that have a clear job to do.',
    },
    overview: [
      'A good content strategy is not a spreadsheet full of keywords. It is a decision system. It tells you which searches matter, which page should target them, what the reader needs to believe, and how each new asset supports the pages around it.',
      'The goal is to stop shipping isolated posts and start building a search footprint that compounds. That means tighter briefs, better internal links, cleaner topic ownership, and fewer pages competing with each other.',
    ],
    bestFor: [
      'Teams with scattered blog traffic and weak conversions',
      'Brands entering a new category or market',
      'Sites with strong expertise but unclear search structure',
    ],
    outcomes: [
      {
        title: 'Intent-led keyword map',
        text: 'Keywords grouped by what the searcher is trying to do, then mapped to existing pages, new pages, or pages that should be consolidated.',
      },
      {
        title: 'Topic cluster structure',
        text: 'A practical architecture for pillar pages, supporting pages, internal links, and content gaps that are worth filling.',
      },
      {
        title: 'Editorial momentum',
        text: 'A calendar with briefs, priority levels, page purpose, primary angle, and clear success signals for each piece.',
      },
    ],
    process: [
      {
        title: 'Read the market',
        text: 'I study search demand, competitors, SERP formats, current rankings, product positioning, and the language your customers already use.',
      },
      {
        title: 'Map the opportunity',
        text: 'I group demand by intent and commercial value, then decide what should be created, refreshed, merged, or ignored.',
      },
      {
        title: 'Brief the work',
        text: 'Your team gets briefs that explain the angle, audience, structure, internal links, and proof points needed to make each page useful.',
      },
    ],
    scope: {
      timeline: '2 to 4 weeks depending on category depth',
      format: 'Keyword map, cluster plan, briefs, and publishing calendar',
      handoff: 'A focused content system instead of a loose list of topics',
    },
    relatedSlugs: ['programmatic-seo', 'reporting-that-helps'],
  },
  {
    number: '03',
    title: 'Programmatic SEO',
    slug: 'programmatic-seo',
    summary:
      'Template driven pages for products, locations, or comparisons. Done right they scale fast. Done wrong they get the whole site demoted, so we build guardrails first.',
    deliverables: ['Template architecture', 'Data integration', 'Indexation guardrails'],
    metaTitle: 'Programmatic SEO | Umais Ali',
    metaDescription:
      'Programmatic SEO strategy for scalable landing pages with real demand, reliable data, useful templates, and indexation guardrails.',
    hero: {
      eyebrow: 'Programmatic SEO',
      lineOne: 'Scale search pages without',
      accent: 'watering them down.',
      intro:
        'I help teams build scalable page systems for products, locations, comparisons, and directories. The focus is useful coverage, clean data, and indexation control before volume becomes a liability.',
    },
    overview: [
      'Programmatic SEO works when every page has a reason to exist. It fails when a template creates thousands of near-empty pages and leaves Google to sort out the mess.',
      'I plan the architecture before pages go live. We define the demand pattern, the required data, the minimum quality bar, the internal linking model, and the rules that decide which pages deserve indexation.',
    ],
    bestFor: [
      'Marketplaces, SaaS directories, and comparison sites',
      'Businesses with structured product, location, or category data',
      'Teams that want scale without thin-page risk',
    ],
    outcomes: [
      {
        title: 'Template strategy',
        text: 'A page model that matches search intent, supports useful copy, and gives every generated page a clear purpose.',
      },
      {
        title: 'Data requirements',
        text: 'A practical list of fields, fallbacks, validation rules, and enrichment needs so templates do not collapse at scale.',
      },
      {
        title: 'Indexation guardrails',
        text: 'Rules for when pages should be indexable, when they should stay out of search, and how to monitor quality after launch.',
      },
    ],
    process: [
      {
        title: 'Validate demand',
        text: 'I confirm the search pattern, SERP expectations, modifiers, competitors, and the page types that can earn traffic.',
      },
      {
        title: 'Design the system',
        text: 'We define templates, required data, internal links, schema, canonical rules, noindex logic, and QA checks.',
      },
      {
        title: 'Launch with control',
        text: 'I help stage the rollout, monitor crawl and indexation, and adjust rules before scale creates avoidable problems.',
      },
    ],
    scope: {
      timeline: '3 to 6 weeks for strategy and launch support',
      format: 'Opportunity model, template brief, data spec, and launch QA',
      handoff: 'A page system that can scale without becoming search clutter',
    },
    relatedSlugs: ['content-and-keywords', 'technical-seo-audits'],
  },
  {
    number: '04',
    title: 'Link Building',
    slug: 'link-building',
    summary:
      'Outreach and digital PR aimed at the publications your buyers already trust. No PBNs, no shady lists, nothing that needs disavowing in six months.',
    deliverables: ['Prospecting and outreach', 'Digital PR pitches', 'Anchor strategy'],
    metaTitle: 'Link Building and Digital PR | Umais Ali',
    metaDescription:
      'Ethical link building and digital PR for teams that need relevant authority, stronger category signals, and outreach that protects the brand.',
    hero: {
      eyebrow: 'Link Building',
      lineOne: 'Earn links from places',
      accent: 'that make sense.',
      intro:
        'I build authority through relevant outreach, useful angles, and publication targets your buyers would recognize. No private networks, no recycled lists, no shortcuts that become cleanup work later.',
    },
    overview: [
      'Links still matter, but the wrong links can make a good site look desperate. The work has to match the brand, the category, and the pages that need authority most.',
      'I focus on prospects with real audiences, topical relevance, and editorial standards. The result is a cleaner link profile and a stronger reason for search engines to trust the pages you care about.',
    ],
    bestFor: [
      'Brands with good content that is not earning enough authority',
      'Competitive categories where page quality alone is not enough',
      'Teams that need outreach without risking the brand',
    ],
    outcomes: [
      {
        title: 'Relevant prospecting',
        text: 'A qualified list of publications, partners, resources, and journalists where the pitch has a real reason to land.',
      },
      {
        title: 'Better pitch angles',
        text: 'Outreach built around useful evidence, expert commentary, data, or resources instead of generic guest post requests.',
      },
      {
        title: 'Anchor and page strategy',
        text: 'A link plan that supports important pages without creating unnatural anchor patterns or overloading one part of the site.',
      },
    ],
    process: [
      {
        title: 'Audit the profile',
        text: 'I review current links, competitor gaps, risk signals, target pages, and the authority needed to compete.',
      },
      {
        title: 'Build the outreach plan',
        text: 'We choose the assets, angles, publications, and outreach rhythm that fit your category and brand voice.',
      },
      {
        title: 'Track quality over volume',
        text: 'Reporting focuses on relevance, placement quality, target page impact, and what each link is meant to support.',
      },
    ],
    scope: {
      timeline: 'Monthly retainers with clear quality targets',
      format: 'Prospecting, outreach, pitch writing, and placement reporting',
      handoff: 'A link profile that looks earned because it is',
    },
    relatedSlugs: ['content-and-keywords', 'reporting-that-helps'],
  },
  {
    number: '05',
    title: 'SEO Migrations',
    slug: 'seo-migrations',
    summary:
      'Replatforming, redesigns, domain moves. The kind of project that quietly erases a year of growth if it goes wrong. I plan it, ship it, and watch it after.',
    deliverables: ['Pre launch audit', 'Redirect mapping', 'Post launch monitoring'],
    metaTitle: 'SEO Migrations | Umais Ali',
    metaDescription:
      'SEO migration planning for redesigns, replatforms, URL changes, and domain moves that need redirects, QA, and post-launch monitoring.',
    hero: {
      eyebrow: 'SEO Migrations',
      lineOne: 'Move the site without',
      accent: 'losing the channel.',
      intro:
        'I plan and monitor migrations so redesigns, replatforms, URL changes, and domain moves do not quietly erase organic growth. The work is detailed, calm, and built around risk control.',
    },
    overview: [
      'A migration is usually treated like a launch checklist item until rankings start slipping. By then the team is trying to debug redirects, templates, canonicals, content changes, and tracking gaps at the same time.',
      'I get involved before launch, document what has to be protected, map the redirects, review the staging site, and stay close after release so small problems do not become traffic losses.',
    ],
    bestFor: [
      'Rebrands, domain changes, and site consolidations',
      'CMS, framework, or ecommerce platform moves',
      'Redesigns that touch templates, URLs, content, or navigation',
    ],
    outcomes: [
      {
        title: 'Risk map',
        text: 'A clear list of the pages, templates, rankings, backlinks, and technical signals that need protection before launch.',
      },
      {
        title: 'Redirect control',
        text: 'A redirect map that preserves important URLs, avoids chains, and gives engineering a direct implementation path.',
      },
      {
        title: 'Launch monitoring',
        text: 'Post-launch checks for crawl errors, indexation shifts, rankings, traffic, sitemap coverage, and analytics continuity.',
      },
    ],
    process: [
      {
        title: 'Document the current site',
        text: 'I capture crawl data, top pages, backlinks, rankings, sitemap coverage, analytics, and URL patterns before anything moves.',
      },
      {
        title: 'Review the staging build',
        text: 'I check templates, metadata, canonicals, robots rules, internal links, structured data, redirects, and tracking before launch.',
      },
      {
        title: 'Watch the release',
        text: 'After launch, I monitor the signals that matter and help the team fix issues while they are still small.',
      },
    ],
    scope: {
      timeline: '4 to 8 weeks depending on release complexity',
      format: 'Migration plan, redirect map, staging QA, launch support, and monitoring',
      handoff: 'A controlled release with fewer surprises after go-live',
    },
    relatedSlugs: ['technical-seo-audits', 'reporting-that-helps'],
  },
  {
    number: '06',
    title: 'Reporting that helps',
    slug: 'reporting-that-helps',
    summary:
      'GA4, Search Console, and Looker dashboards built so a non SEO can open them on a Monday and know what to do that week.',
    deliverables: ['GA4 and GSC setup', 'Looker dashboards', 'Monthly insights'],
    metaTitle: 'SEO Reporting and Dashboards | Umais Ali',
    metaDescription:
      'SEO reporting, GA4, Search Console, and Looker dashboards that connect organic performance to decisions your team can act on.',
    hero: {
      eyebrow: 'Reporting that helps',
      lineOne: 'Turn SEO reporting into',
      accent: 'a decision tool.',
      intro:
        'I build reporting that helps teams understand what changed, why it changed, and what to do next. The goal is less dashboard theatre and more useful Monday morning decisions.',
    },
    overview: [
      'Most SEO reports are either too shallow to be useful or too dense to survive outside the SEO team. They list movement without explaining whether anyone should care.',
      'I connect GA4, Search Console, Looker, and rank data into a reporting view that separates noise from signal. Leadership gets the story. Operators get the next action.',
    ],
    bestFor: [
      'Teams with reports nobody trusts or reads',
      'Founders and marketing leads who need clearer organic performance',
      'SEO teams that need cleaner weekly and monthly workflows',
    ],
    outcomes: [
      {
        title: 'Cleaner measurement',
        text: 'GA4 and Search Console views checked for tracking gaps, channel confusion, landing page noise, and missing conversion context.',
      },
      {
        title: 'Readable dashboards',
        text: 'Looker dashboards that show organic performance by page group, query theme, funnel stage, and business outcome.',
      },
      {
        title: 'Useful insights',
        text: 'Reporting notes that explain what moved, what probably caused it, what deserves attention, and what can be ignored.',
      },
    ],
    process: [
      {
        title: 'Audit the data',
        text: 'I review GA4, Search Console, Looker, rank tracking, events, conversions, and existing stakeholder reports.',
      },
      {
        title: 'Design the view',
        text: 'We decide which questions the report must answer, then build dashboards around decisions instead of vanity metrics.',
      },
      {
        title: 'Create the rhythm',
        text: 'I set up a reporting cadence, explain the views, and leave notes that make monthly performance easier to discuss.',
      },
    ],
    scope: {
      timeline: '1 to 3 weeks depending on data quality',
      format: 'Tracking review, dashboard build, reporting notes, and walkthrough',
      handoff: 'A reporting setup people can use without translating SEO jargon',
    },
    relatedSlugs: ['technical-seo-audits', 'content-and-keywords'],
  },
]

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug)
}

export const marquee = [
  'Technical SEO',
  'Content systems',
  'Programmatic pages',
  'Migrations done right',
  'Link building, no shortcuts',
  'Reporting people actually read',
  'Core Web Vitals',
  'Search Console',
  'Five years in',
]

export const testimonials = [
  {
    quote:
      'Umais is the rare SEO who can talk to engineers without losing the marketers in the room. He shipped a migration plan that saved us months of guessing.',
    author: 'Sara M.',
    role: 'Head of Marketing, CloudStack',
  },
  {
    quote:
      'We had been told for two years that our category pages were fine. Three months in, traffic was up 90 percent. Wish we had called him sooner.',
    author: 'Daniel R.',
    role: 'Founder, GreenLeaf Organics',
  },
]

export const faqs = [
  {
    q: 'How do you actually charge?',
    a: 'Most engagements are a flat monthly retainer based on scope. Audits and migrations are usually a fixed price. No hourly billing, no surprise invoices.',
  },
  {
    q: 'Do you work with in house teams?',
    a: 'Yes, that is most of what I do. I plug in next to your marketing or engineering team, do the work, and hand it over with documentation when we are done.',
  },
  {
    q: 'How long until we see results?',
    a: 'Honest answer: technical wins can show up in weeks, content driven growth usually starts to compound around month three to six. Anyone promising faster is selling you something.',
  },
  {
    q: 'What about AI search and LLMs?',
    a: 'Same fundamentals: be crawlable, be useful, be cited by people who matter. The surface changes, the work mostly does not.',
  },
]

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/umaisali' },
  { label: 'X / Twitter', href: 'https://x.com/umaisali' },
  { label: 'GitHub', href: 'https://github.com/umaisali' },
]

export const CONTACT_EMAIL = 'hello@umaisali.com'
