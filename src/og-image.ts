/**
 * Dynamic Open Graph image — the poster that appears in link previews.
 *
 * Built with Satori (layout) + @resvg/resvg-js (PNG), in the spirit of the
 * Next.js `og-image.tsx` / `@vercel/og` pattern. Reuses the site's self-hosted
 * Instrument Serif so the social card matches the live editorial typography.
 *
 * Design intent: read clearly at 200px wide. Name, headline, tagline, URL.
 * Nothing else.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { Request, Response } from 'express'
import satori, { type SatoriOptions } from 'satori'
// wawoff2 ships no types; only `decompress` is needed.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error -- no upstream type declarations
import wawoff2 from 'wawoff2'
import { SITE_NAME, SITE_URL } from './data/site'

const ROOT = path.resolve(__dirname, '..')
const FONT_DIR = path.join(ROOT, 'public', 'fonts')

// Match the dark-theme tokens declared in `src/styles/main.css` (`:root[data-theme="dark"]`).
const COLORS = {
  background: '#15130f',
  foreground: '#fbf8f1',
  muted: 'rgba(251, 248, 241, 0.55)',
  accent: '#ecc878', // warm gold (~--primary in dark theme)
} as const

const WIDTH = 1200
const HEIGHT = 630

let fontsPromise: Promise<SatoriOptions['fonts']> | null = null
let pngPromise: Promise<Buffer> | null = null

async function loadFont(file: string): Promise<Buffer> {
  const woff2 = await fs.readFile(path.join(FONT_DIR, file))
  // wawoff2.decompress returns a Uint8Array of TTF bytes.
  const ttf: Uint8Array = await wawoff2.decompress(woff2)
  return Buffer.from(ttf)
}

async function loadFonts(): Promise<SatoriOptions['fonts']> {
  // Geist + JetBrains Mono ship as variable fonts whose `fvar` table breaks
  // satori's opentype parser, so the OG card uses Instrument Serif (regular +
  // italic) — the same display face used for headings on the site.
  const [serif, italic] = await Promise.all([
    loadFont('instrument-serif-latin.woff2'),
    loadFont('instrument-serif-italic-latin.woff2'),
  ])
  return [
    { name: 'Instrument Serif', data: serif, weight: 400, style: 'normal' },
    { name: 'Instrument Serif', data: italic, weight: 400, style: 'italic' },
  ]
}

function getFonts(): Promise<SatoriOptions['fonts']> {
  fontsPromise ??= loadFonts()
  return fontsPromise
}

/**
 * Tiny `h()` helper so this file reads like JSX  ithout needing a JSX runtime.
 * Satori accepts the same `{ type, props }` shape React.createElement produces.
 */
type Node = string | { type: string; props: Record<string, unknown> } | null
function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: Node[]
): { type: string; props: Record<string, unknown> } {
  const flat = children.flat(Number.POSITIVE_INFINITY).filter((c) => c !== null && c !== undefined)
  return {
    type,
    props: {
      ...(props ?? {}),
      children: flat.length === 1 ? flat[0] : flat,
    },
  }
}

function buildTree(): ReturnType<typeof h> {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '90px 100px',
        backgroundColor: COLORS.background,
        backgroundImage:
          'radial-gradient(900px 600px at 100% 0%, rgba(236, 200, 120, 0.18), transparent 60%)',
        color: COLORS.foreground,
        fontFamily: 'Instrument Serif',
      },
    },

    // Name (top)
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: 36,
          letterSpacing: '-0.01em',
          color: COLORS.foreground,
        },
      },
      SITE_NAME,
    ),

    // Headline (middle, dominant)
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          fontSize: 124,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          color: COLORS.foreground,
        },
      },
      h('div', { style: { display: 'flex' } }, 'SEO that actually'),
      h(
        'div',
        { style: { display: 'flex' } },
        h(
          'span',
          { style: { display: 'flex', fontStyle: 'italic', color: COLORS.accent } },
          'moves the needle.',
        ),
      ),
    ),

    // Footer line — role left, URL right
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          fontSize: 28,
          color: COLORS.muted,
        },
      },
      h('div', { style: { display: 'flex' } }, 'SEO Executive'),
      h(
        'div',
        { style: { display: 'flex', color: COLORS.foreground } },
        SITE_URL.replace(/^https?:\/\//, ''),
      ),
    ),
  )
}

async function renderPng(): Promise<Buffer> {
  const fonts = await getFonts()
  const svg = await satori(buildTree() as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
  return Buffer.from(png)
}

/** Lazy-cache the rendered PNG in memory; the design has no per-request inputs. */
export function getOgImage(): Promise<Buffer> {
  if (!pngPromise) {
    const attempt = renderPng()
    // On failure, clear only if this attempt is still the active one (handles concurrent failures).
    attempt.catch(() => {
      if (pngPromise === attempt) pngPromise = null
    })
    pngPromise = attempt
  }
  return pngPromise
}

export async function ogImageHandler(_req: Request, res: Response): Promise<void> {
  try {
    const png = await getOgImage()
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, immutable')
    res.setHeader('Content-Length', png.byteLength.toString())
    res.end(png)
  } catch (err) {
    console.error('[og-image] render failed', err)
    res.status(500).end()
  }
}
