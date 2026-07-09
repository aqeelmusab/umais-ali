#!/usr/bin/env node
/**
 * Copies vendored front-end assets (htmx, GSAP) from node_modules into
 * public/js/, named with their resolved version, and keeps the matching
 * `integrity` (SRI) hash in src/views/layout.pug in sync.
 *
 * These libraries are loaded via plain <script src> tags (no client-side
 * bundler), so the actual browser-facing file has to live in public/js/.
 * Pulling them in as real npm dependencies just means Dependabot/pnpm track
 * the version instead of it being a hand-downloaded file; this script is
 * the step that turns "installed in node_modules" into "vendored + hashed".
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const publicJsDir = path.join(rootDir, 'public', 'js')
const layoutPath = path.join(rootDir, 'src', 'views', 'layout.pug')

const assets = [
  { name: 'htmx', pkg: 'htmx.org', distFile: 'dist/htmx.min.js' },
  { name: 'gsap', pkg: 'gsap', distFile: 'dist/gsap.min.js' },
]

function readInstalledVersion(pkg) {
  const pkgJsonPath = path.join(rootDir, 'node_modules', pkg, 'package.json')
  return JSON.parse(readFileSync(pkgJsonPath, 'utf8')).version
}

function removeStaleVersions(name, keepFilename) {
  for (const file of readdirSync(publicJsDir)) {
    if (file.startsWith(`${name}-`) && file.endsWith('.min.js') && file !== keepFilename) {
      unlinkSync(path.join(publicJsDir, file))
      console.log(`removed stale ${file}`)
    }
  }
}

function syncLayoutScriptTag(layoutSrc, name, version, hash) {
  const pattern = new RegExp(
    `(script\\(src='/js/${name}-)[^']+(\\.min\\.js' integrity='sha384-)[^']+(')`,
  )
  if (!pattern.test(layoutSrc)) {
    throw new Error(`Could not find a "${name}" vendored <script> tag in ${layoutPath}`)
  }
  return layoutSrc.replace(pattern, `$1${version}$2${hash}$3`)
}

let layoutSrc = readFileSync(layoutPath, 'utf8')
let changed = false

for (const asset of assets) {
  const version = readInstalledVersion(asset.pkg)
  const filename = `${asset.name}-${version}.min.js`
  const srcPath = path.join(rootDir, 'node_modules', asset.pkg, asset.distFile)
  const destPath = path.join(publicJsDir, filename)
  const content = readFileSync(srcPath)
  const hash = createHash('sha384').update(content).digest('base64')

  writeFileSync(destPath, content)
  removeStaleVersions(asset.name, filename)

  const nextLayoutSrc = syncLayoutScriptTag(layoutSrc, asset.name, version, hash)
  if (nextLayoutSrc !== layoutSrc) changed = true
  layoutSrc = nextLayoutSrc

  console.log(`vendored ${asset.pkg}@${version} -> public/js/${filename}`)
}

if (changed) {
  writeFileSync(layoutPath, layoutSrc)
  console.log('updated src/views/layout.pug with new integrity hash(es)')
}
