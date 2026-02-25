import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const SITE_URL = 'https://umaisali.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1816',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Umais Ali — SEO Executive | Organic Growth Strategist',
    template: '%s | Umais Ali',
  },
  description:
    'SEO Executive helping businesses grow through organic search. Technical audits, keyword strategy, content optimization, and link building that delivers real results. 5+ years, 40+ projects, 3M+ organic visits driven.',
  keywords: [
    'SEO Executive',
    'SEO Strategist',
    'Organic Search',
    'Technical SEO',
    'Content Strategy',
    'Link Building',
    'Keyword Research',
    'SEO Consultant',
    'SEO Audits',
    'Google Rankings',
    'Umais Ali',
  ],
  authors: [{ name: 'Umais Ali', url: SITE_URL }],
  creator: 'Umais Ali',
  publisher: 'Umais Ali',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Umais Ali',
    title: 'Umais Ali — SEO Executive | Organic Growth Strategist',
    description:
      'SEO Executive helping businesses grow through organic search. Technical audits, keyword strategy, content optimization, and link building that delivers real results.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Umais Ali — SEO Executive',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Umais Ali — SEO Executive | Organic Growth Strategist',
    description:
      'SEO Executive helping businesses grow through organic search. 5+ years, 40+ projects, 3M+ organic visits driven.',
    images: ['/og-image.png'],
    creator: '@umaisali',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${_inter.variable} ${_playfair.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
