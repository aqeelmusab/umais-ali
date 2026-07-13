// Module customization hook for the Node test runner (run via tsx).
//
// Astro's `astro:assets` pipeline turns `import img from './x.jpg'` into an
// `ImageMetadata` object at build time. The plain Node test runner cannot load
// binary image files, so `src/data/projects.ts` (which imports the project
// images) would crash on import. This hook intercepts image imports and returns
// a lightweight `ImageMetadata`-shaped stub so data modules stay importable in
// tests without pulling in the full Astro/Vite build.

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i

export async function load(url, context, nextLoad) {
  if (IMAGE_RE.test(url)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default { src: "/stub-image.jpg", width: 1024, height: 1024, format: "jpg" }',
    }
  }
  return nextLoad(url, context)
}
