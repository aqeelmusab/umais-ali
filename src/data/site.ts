export const SITE_URL = 'https://umaisali.com'
export const SITE_NAME = 'Umais Ali'
export const SITE_TITLE = 'Umais Ali, SEO that actually moves the needle'
export const SITE_DESCRIPTION =
  'I help teams turn search into a real growth channel. Technical audits, content systems, link building, and migrations that hold up after launch. Five years in, forty something projects, three million plus organic visits.'

export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
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
    slug: 'technical-seo-audits',
    title: 'Technical SEO Audits',
    summary:
      'A real look at why your site is not ranking. Crawl issues, indexation, schema, Core Web Vitals. You get a short fix list ordered by impact, not a sixty page PDF nobody reads.',
    deliverables: ['Crawl and log analysis', 'Indexation map', 'CWV remediation'],
    page: {
      eyebrow: 'Technical SEO Audits',
      title: 'Find the issues that are holding search back.',
      description:
        'A technical SEO audit for teams that need a clear diagnosis, not a giant PDF. I find the crawl, indexation, performance, and architecture issues that are limiting growth, then turn them into a fix list your team can actually ship.',
      intro:
        'Most technical SEO problems are not dramatic. They are small decisions that compound over time. A few crawl traps, thin templates, blocked assets, slow pages, duplicate URLs, broken canonicals, and internal links that bury important pages. The audit is built to separate noise from the work that will move rankings, traffic, and revenue.',
      bestFor: [
        'Sites with flat or declining organic traffic',
        'Teams preparing for a redesign or platform change',
        'Marketing teams that need engineering buy in',
        'Founders who want a second opinion before investing in content',
      ],
      process: [
        {
          title: 'Crawl and indexation review',
          body: 'I map what Google can find, what it should find, and what should be kept out of the index. This usually reveals the first layer of wasted crawl budget and duplicated intent.',
        },
        {
          title: 'Template and page quality audit',
          body: 'I review the page types that drive search visibility and check whether the content, metadata, schema, internal links, and intent match are strong enough to compete.',
        },
        {
          title: 'Prioritized fix plan',
          body: 'You get the issues grouped by impact, difficulty, and owner. The goal is to give marketing and engineering the same view of what matters first.',
        },
      ],
      outcomes: [
        'A clear technical SEO roadmap',
        'Cleaner index coverage and fewer duplicate signals',
        'Better crawl paths to commercial pages',
        'A fix list your team can work through without guesswork',
      ],
      metrics: ['Index coverage', 'Core Web Vitals', 'Crawl depth', 'Organic landing pages'],
    },
  },
  {
    number: '02',
    slug: 'content-and-keywords',
    title: 'Content and Keywords',
    summary:
      'Topic clusters built around the things your buyers actually search for, mapped to pages on your site so the work compounds instead of fighting itself.',
    deliverables: ['Intent mapped keywords', 'Topic clusters', 'Editorial calendar'],
    page: {
      eyebrow: 'Content and Keywords',
      title: 'Build content around what buyers already want to know.',
      description:
        'Keyword research and content planning for teams that want search traffic with a purpose. I turn scattered ideas into a focused content system tied to intent, product value, and realistic ranking opportunities.',
      intro:
        'Good content strategy is not a spreadsheet full of keywords. It is a set of choices about which topics matter, which pages deserve to exist, how they connect, and what a reader should do next. I help teams build that structure before they spend months writing into the void.',
      bestFor: [
        'Teams publishing content without a clear search framework',
        'Companies with strong expertise but weak organic visibility',
        'Sites with overlapping articles that compete with each other',
        'Brands that need content tied to pipeline, not vanity traffic',
      ],
      process: [
        {
          title: 'Intent and opportunity research',
          body: 'I group keywords by what the searcher needs, how competitive the result is, and how closely the topic connects to your product or service.',
        },
        {
          title: 'Cluster and page mapping',
          body: 'Each topic gets a home. Some deserve a landing page, some need a guide, and some should be merged into something you already have.',
        },
        {
          title: 'Editorial plan and briefs',
          body: 'Writers get briefs with audience context, search intent, structure, internal links, and the proof needed to make the page useful.',
        },
      ],
      outcomes: [
        'A focused keyword map by intent',
        'Cleaner topic clusters with less cannibalization',
        'Briefs that help writers produce useful pages faster',
        'Content tied to commercial paths through the site',
      ],
      metrics: ['Ranking groups', 'Organic assisted conversions', 'Content velocity', 'Internal link coverage'],
    },
  },
  {
    number: '03',
    slug: 'programmatic-seo',
    title: 'Programmatic SEO',
    summary:
      'Template driven pages for products, locations, or comparisons. Done right they scale fast. Done wrong they get the whole site demoted, so we build guardrails first.',
    deliverables: ['Template architecture', 'Data integration', 'Indexation guardrails'],
    page: {
      eyebrow: 'Programmatic SEO',
      title: 'Scale useful pages without turning the site into clutter.',
      description:
        'Programmatic SEO planning for teams with products, locations, categories, integrations, or comparisons that can become valuable search pages. I design the templates, data rules, and indexation controls before scale becomes a liability.',
      intro:
        'Programmatic SEO works when each page has a reason to exist. The template has to answer a real query, the data has to be strong, and the indexation rules have to protect the rest of the site. I help teams build the system with enough discipline to grow safely.',
      bestFor: [
        'Marketplaces, SaaS products, directories, and ecommerce sites',
        'Teams with structured data that could support search pages',
        'Companies planning location, comparison, or integration pages',
        'Sites that need scale without thin content risk',
      ],
      process: [
        {
          title: 'Opportunity and page type selection',
          body: 'I identify which query patterns are worth targeting and which ones should be left alone. Not every data point deserves an indexed page.',
        },
        {
          title: 'Template strategy',
          body: 'We define what each page must include to be helpful, from unique copy blocks and data modules to internal links and schema.',
        },
        {
          title: 'Indexation controls',
          body: 'I set rules for noindex, canonical tags, sitemap inclusion, quality thresholds, and monitoring so weak pages do not flood the index.',
        },
      ],
      outcomes: [
        'A validated set of scalable page types',
        'Templates built around search intent and useful data',
        'Indexation rules that protect site quality',
        'A monitoring plan for growth and cleanup',
      ],
      metrics: ['Indexed page quality', 'Template traffic', 'Long tail rankings', 'Conversion by page type'],
    },
  },
  {
    number: '04',
    slug: 'link-building',
    title: 'Link Building',
    summary:
      'Outreach and digital PR aimed at the publications your buyers already trust. No PBNs, no shady lists, nothing that needs disavowing in six months.',
    deliverables: ['Prospecting and outreach', 'Digital PR pitches', 'Anchor strategy'],
    page: {
      eyebrow: 'Link Building',
      title: 'Earn links that make sense for the brand.',
      description:
        'A measured approach to link building and digital PR. I focus on relevant publications, useful angles, and outreach that supports authority without creating risk for the site later.',
      intro:
        'Links still matter, but the wrong links create a mess. The goal is not to collect random domains. The goal is to earn coverage from places your audience, industry, and search engines can reasonably trust. That takes better prospecting, better angles, and patience.',
      bestFor: [
        'Brands in competitive search results',
        'Teams with good content that is not earning authority',
        'Companies that need safer alternatives to cheap link vendors',
        'Sites building authority around a new category or product',
      ],
      process: [
        {
          title: 'Authority and competitor review',
          body: 'I look at the links driving visibility in your market and identify realistic opportunities that fit your brand and budget.',
        },
        {
          title: 'Prospecting and angle development',
          body: 'Targets are grouped by relevance and outreach angle. The pitch has to give someone a real reason to care, not just ask for a backlink.',
        },
        {
          title: 'Outreach and quality control',
          body: 'Every opportunity is checked for relevance, placement quality, and risk. I would rather ship fewer good links than a larger report full of weak ones.',
        },
      ],
      outcomes: [
        'A clean prospect list by relevance and quality',
        'Digital PR angles that fit the market',
        'Safer links from publications with real context',
        'Anchor text guidance that avoids over-optimization',
      ],
      metrics: ['Referring domains', 'Link relevance', 'Authority growth', 'Ranking movement on target pages'],
    },
  },
  {
    number: '05',
    slug: 'seo-migrations',
    title: 'SEO Migrations',
    summary:
      'Replatforming, redesigns, domain moves. The kind of project that quietly erases a year of growth if it goes wrong. I plan it, ship it, and watch it after.',
    deliverables: ['Pre launch audit', 'Redirect mapping', 'Post launch monitoring'],
    page: {
      eyebrow: 'SEO Migrations',
      title: 'Move the site without losing the traffic you earned.',
      description:
        'SEO migration support for redesigns, replatforms, domain changes, and major information architecture updates. I plan the move, protect important URLs, and monitor the launch until the risk window is under control.',
      intro:
        'A migration is one of the easiest ways to lose organic growth. The damage usually comes from simple misses: changed URLs, weak redirect logic, missing metadata, blocked sections, broken canonicals, and pages that disappear during launch. I build the plan before those mistakes become expensive.',
      bestFor: [
        'Teams moving to a new CMS or ecommerce platform',
        'Companies redesigning high traffic templates',
        'Brands changing domains, URL structures, or navigation',
        'Marketing leaders who need launch risk reduced',
      ],
      process: [
        {
          title: 'Pre launch inventory',
          body: 'I identify the pages, templates, rankings, links, and traffic sources that need protection before the new site goes live.',
        },
        {
          title: 'Redirect and validation plan',
          body: 'Every important URL gets a destination. I check redirects, canonicals, metadata, internal links, robots rules, and sitemap logic before launch.',
        },
        {
          title: 'Post launch monitoring',
          body: 'After launch, I watch crawl errors, indexation, rankings, analytics, and server behavior so issues can be fixed while they are still small.',
        },
      ],
      outcomes: [
        'A migration checklist by owner and deadline',
        'Redirect mapping for high value URLs',
        'Pre launch and post launch QA',
        'Monitoring that catches traffic loss early',
      ],
      metrics: ['Redirect health', 'Organic traffic retention', 'Index coverage', 'Ranking recovery'],
    },
  },
  {
    number: '06',
    slug: 'seo-reporting',
    title: 'Reporting that helps',
    summary:
      'GA4, Search Console, and Looker dashboards built so a non SEO can open them on a Monday and know what to do that week.',
    deliverables: ['GA4 and GSC setup', 'Looker dashboards', 'Monthly insights'],
    page: {
      eyebrow: 'SEO Reporting',
      title: 'Turn search data into decisions people can use.',
      description:
        'SEO reporting and dashboard setup for teams that need clarity. I connect GA4, Search Console, Looker Studio, and campaign context so reporting explains what changed and what to do next.',
      intro:
        'A good report should not make people hunt for the point. It should show what changed, why it matters, and where attention should go next. I build reporting that works for marketers, founders, and operators who need a clean view of organic performance.',
      bestFor: [
        'Teams with messy GA4 or Search Console reporting',
        'Founders who want a simple view of organic growth',
        'Marketing teams reporting to leadership every month',
        'Companies that need SEO tied to pipeline and revenue',
      ],
      process: [
        {
          title: 'Measurement review',
          body: 'I check tracking, conversions, channel grouping, Search Console properties, and any gaps that make SEO performance hard to trust.',
        },
        {
          title: 'Dashboard design',
          body: 'The dashboard is organized around the questions people actually ask: what grew, what dropped, which pages matter, and where the next action is.',
        },
        {
          title: 'Insight rhythm',
          body: 'I add a practical reporting cadence so the dashboard becomes a working tool, not a link that gets opened once a quarter.',
        },
      ],
      outcomes: [
        'Cleaner SEO measurement across GA4 and Search Console',
        'A dashboard that separates signal from noise',
        'Monthly insights tied to action',
        'Reporting that leadership can understand quickly',
      ],
      metrics: ['Organic sessions', 'Qualified conversions', 'Landing page performance', 'Query and page movement'],
    },
  },
]

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
