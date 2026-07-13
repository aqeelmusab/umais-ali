import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://umaisali.com',
  trailingSlash: 'never',
  adapter: vercel(),
  integrations: [svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
