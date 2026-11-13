// Gamybinis serveris: pateikia sugeneruotą svetainę (dist/) ir priima užklausas.
// Paleidimas: npm run build && npm start
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { handleEnquiry, handleReservation } from './enquiry.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT ?? 8787)

try {
  process.loadEnvFile?.(path.join(ROOT, '.env'))
} catch {
  /* .env nebūtinas */
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt'])

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

function resolveFile(urlPath) {
  let p
  try {
    p = decodeURIComponent(urlPath)
  } catch {
    return null
  }
  const target = path.normalize(path.join(DIST, p))
  if (!target.startsWith(DIST)) return null
  const candidates = [target, path.join(target, 'index.html')]
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c
    } catch {
      /* nėra */
    }
  }
  return null
}

function serveFile(req, res, file, status = 200) {
  const ext = path.extname(file)
  res.statusCode = status
  res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream')
  const rel = path.relative(DIST, file).replaceAll('\\', '/')
  if (rel.startsWith('assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  else if (ext === '.html') res.setHeader('Cache-Control', 'no-cache')
  else res.setHeader('Cache-Control', 'public, max-age=604800')

  const accept = String(req.headers['accept-encoding'] ?? '')
  if (COMPRESSIBLE.has(ext) && /\b(br|gzip)\b/.test(accept)) {
    const br = /\bbr\b/.test(accept)
    res.setHeader('Content-Encoding', br ? 'br' : 'gzip')
    res.setHeader('Vary', 'Accept-Encoding')
    fs.createReadStream(file)
      .pipe(br ? zlib.createBrotliCompress() : zlib.createGzip())
      .pipe(res)
    return
  }
  fs.createReadStream(file).pipe(res)
}

const server = http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
  const url = new URL(req.url ?? '/', 'http://localhost')

  const api = { '/api/uzklausa': handleEnquiry, '/api/rezervacija': handleReservation }[url.pathname]
  if (api) {
    try {
      await api(req, res)
    } catch (e) {
      console.error(e)
      if (!res.headersSent) res.writeHead(500).end()
    }
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  // /automobiliai/ → /automobiliai (viena kanoninė nuoroda)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    res.writeHead(301, { Location: url.pathname.slice(0, -1) + url.search }).end()
    return
  }

  const file = resolveFile(url.pathname)
  if (file) return serveFile(req, res, file)
  const notFound = path.join(DIST, '404.html')
  if (fs.existsSync(notFound)) return serveFile(req, res, notFound, 404)
  res.writeHead(404).end('Not found')
})

server.listen(PORT, () => {
  console.log(`Svetainė veikia: http://localhost:${PORT}`)
  if (!process.env.SMTP_HOST) console.warn('Dėmesio: SMTP_HOST nenustatytas – užklausos nebus siunčiamos el. paštu.')
})
