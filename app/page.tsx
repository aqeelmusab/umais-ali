import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SelectedWork } from "@/components/selected-work"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://umaisali.com/#website',
      url: 'https://umaisali.com',
      name: 'Umais Ali — SEO Executive',
      description:
        'SEO Executive helping businesses grow through organic search. Technical audits, keyword strategy, content optimization, and link building that delivers real results.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'Person',
      '@id': 'https://umaisali.com/#person',
      name: 'Umais Ali',
      url: 'https://umaisali.com',
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
      sameAs: [],
    },
    {
      '@type': 'ProfilePage',
      '@id': 'https://umaisali.com/#profilepage',
      url: 'https://umaisali.com',
      name: 'Umais Ali — SEO Executive',
      isPartOf: { '@id': 'https://umaisali.com/#website' },
      about: { '@id': 'https://umaisali.com/#person' },
      mainEntity: { '@id': 'https://umaisali.com/#person' },
      inLanguage: 'en-US',
    },
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <SelectedWork />
        <About />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
