import type { ImageMetadata } from 'astro'
import project1 from '../assets/projects/project-1.jpg'
import project2 from '../assets/projects/project-2.jpg'
import project3 from '../assets/projects/project-3.jpg'
import project4 from '../assets/projects/project-4.jpg'
import project5 from '../assets/projects/project-5.jpg'

export interface Project {
  id: number
  slug: string
  title: string
  category: string
  description: string
  longDescription: string
  tags: string[]
  image: ImageMetadata
  year: string
  client: string
  role: string
  result?: string
}

export const projects: Project[] = [
  {
    id: 1,
    slug: 'greenleaf-organics',
    title: 'GreenLeaf Organics',
    category: 'E-Commerce SEO',
    description:
      'Took an organic food brand from page three to a real revenue channel in six months.',
    longDescription:
      'GreenLeaf had good products and almost no traffic. They were buried on page three for the keywords that mattered, and the team had been told for two years that the site was fine. It was not. The audit flagged crawl issues, weirdly templated product descriptions, and a URL structure that was confusing both Google and the people running the store. We rewrote a couple hundred product pages, fixed the architecture, and built out a content calendar around purchase intent. Six months in, organic traffic was up 210 percent and organic revenue had grown 175 percent. Their flagship category landed on page one for the first time.',
    tags: ['Technical SEO', 'Content Strategy', 'E-Commerce'],
    image: project1,
    year: '2025',
    client: 'GreenLeaf Organics',
    role: 'SEO Lead',
    result: '+210% Traffic',
  },
  {
    id: 2,
    slug: 'cloudstack-saas',
    title: 'CloudStack SaaS',
    category: 'B2B SEO',
    description:
      'Built an organic signup channel for a cloud startup that was paying too much for ads.',
    longDescription:
      'CloudStack was burning through paid budget and wanted a channel that did not get more expensive every quarter. We started bottom of funnel, mapping the keywords their best customers were typing the week before they signed up. From there we built a programmatic system for their docs and comparison pages, and ran a real outreach campaign through technical guest posts. Twelve months later, organic signups were up 340 percent, they ranked on page one for 45 buyer intent keywords, and cost per lead from organic was less than half of what paid was costing them.',
    tags: ['B2B SEO', 'Link Building', 'Programmatic SEO'],
    image: project2,
    year: '2024',
    client: 'CloudStack Inc.',
    role: 'SEO Strategist',
    result: '+340% Signups',
  },
  {
    id: 3,
    slug: 'metro-dental-group',
    title: 'Metro Dental Group',
    category: 'Local SEO',
    description:
      'Eight clinics, almost no map pack visibility, until they were the default in every neighborhood.',
    longDescription:
      'Metro Dental had eight locations and almost none of them showed up when someone nearby searched for a dentist. People were finding the competitor across the street. We rebuilt every Google Business Profile, gave each location its own landing page with content that was actually about that neighborhood, added local schema, and ran a steady review campaign. Inside four months, every clinic was in the top three of the local pack for its area. Bookings from organic search went up 65 percent and the average rating moved from 3.8 to 4.6.',
    tags: ['Local SEO', 'Google Business', 'Schema Markup'],
    image: project3,
    year: '2024',
    client: 'Metro Dental Group',
    role: 'SEO Consultant',
    result: '+65% Bookings',
  },
  {
    id: 4,
    slug: 'stylevault-magazine',
    title: 'StyleVault Magazine',
    category: 'Content SEO',
    description: 'A fashion blog with great writing and no traffic. Three quarters later, both.',
    longDescription:
      'StyleVault had real writers turning out real articles. None of it ranked. The problem was not the writing, it was that everything was structured like a personal blog from 2014. Articles had no keyword focus, internal links were random, and dozens of pages were quietly cannibalising each other. We ran a content gap analysis, built clusters around their strongest categories, consolidated the duplicates, and put a quarterly refresh on the calendar. Traffic grew 280 percent and they now hold the top spot for over thirty competitive fashion terms. Ad revenue from organic pages roughly tripled.',
    tags: ['Content Strategy', 'On-Page SEO', 'Analytics'],
    image: project4,
    year: '2024',
    client: 'StyleVault Magazine',
    role: 'SEO and Content Strategist',
    result: '+280% Traffic',
  },
  {
    id: 5,
    slug: 'fitpro-equipment',
    title: 'FitPro Equipment',
    category: 'Technical SEO',
    description: 'A botched migration cost them 40 percent of traffic. We got it back, then some.',
    longDescription:
      'FitPro replatformed and woke up to a 40 percent drop in organic traffic. Nobody had set up redirects properly and Search Console was on fire. When I came in there were over 500 redirect chains, hundreds of duplicate pages, and Core Web Vitals deep in the red. We rebuilt the redirect map, fixed the canonical mess, sorted the sitemap, and worked with their engineers on the speed work. Three months later traffic had not just recovered, it was 150 percent above where it had been before the migration. The 30k a month they were losing in organic revenue came back, and then some.',
    tags: ['Technical SEO', 'Site Migration', 'Core Web Vitals'],
    image: project5,
    year: '2025',
    client: 'FitPro Equipment',
    role: 'Technical SEO Lead',
    result: '+150% Recovery',
  },
]
