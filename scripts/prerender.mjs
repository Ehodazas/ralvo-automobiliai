// Po `vite build` sugeneruoja kiekvieno puslapio statinį HTML su turiniu ir metaduomenimis,
// taip pat sitemap.xml ir robots.txt. Paieškos sistemos mato pilną turinį be JavaScript.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SSR = path.join(ROOT, 'dist-ssr')

const { render, routes, metaFor, site, sitemapEntries } = await import(pathToFileURL(path.join(SSR, 'entry-server.js')).href)
const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8')
const base = site.url.replace(/\/$/, '')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function head(m) {
  const url = base + m.path
  const image = base + (m.image ?? '/og.jpg')
  return [
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    m.noindex ? `<meta name="robots" content="noindex" />` : '',
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(m.jsonLd ?? []).map((ld) => `<script type="application/ld+json" data-ld>${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ')
}

function page(url, meta) {
  return template
    .replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace('<!--head-->', head(meta))
    .replace('<!--app-->', render(url))
}

for (const url of routes) {
  const out = url === '/' ? path.join(DIST, 'index.html') : path.join(DIST, url, 'index.html')
  await fs.mkdir(path.dirname(out), { recursive: true })
  await fs.writeFile(out, page(url, metaFor(url)))
}
await fs.writeFile(path.join(DIST, '404.html'), page('/404', metaFor('/404')))

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries()
  .map((e) => `  <url><loc>${esc(base + e.path)}</loc><lastmod>${e.lastmod ?? today}</lastmod></url>`)
  .join('\n')}
</urlset>
`
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap)
await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`)
await fs.rm(SSR, { recursive: true, force: true })

console.log(`Sugeneruota puslapių: ${routes.length + 1}, sitemap.xml ir robots.txt`)
