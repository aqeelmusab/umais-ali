import type { APIRoute } from 'astro'
import { getOgImage } from '../og-image'

export const GET: APIRoute = async () => {
  const png = await getOgImage()
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': png.byteLength.toString(),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
    },
  })
}
