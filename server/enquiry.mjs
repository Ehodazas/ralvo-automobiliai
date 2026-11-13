// Užklausos formos apdorojimas. Naudojamas ir gamybiniame serveryje (server/index.mjs),
// ir Vite kūrimo serveryje (vite.config.ts), todėl forma veikia abiem atvejais.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MAX_BODY = 10 * 1024
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s()-]{8,}$/

/** IP → užklausų laikai. Laikoma tik atmintyje, įrašai pašalinami po 10 min. */
const hits = new Map()
setInterval(() => {
  const now = Date.now()
  for (const [ip, times] of hits) {
    const fresh = times.filter((t) => now - t < RATE_WINDOW_MS)
    if (fresh.length) hits.set(ip, fresh)
    else hits.delete(ip)
  }
}, 60 * 1000).unref()

function rateLimited(ip) {
  const now = Date.now()
  const times = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  times.push(now)
  hits.set(ip, times)
  return times.length > RATE_MAX
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const clean = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, max)

let vehiclesCache
async function vehicleTitle(slug) {
  if (!slug) return null
  vehiclesCache ??= JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/vehicles.json'), 'utf8'))
  const v = vehiclesCache.find((x) => x.slug === slug)
  return v ? `${v.make} ${v.model} ${v.version}, ${v.year} (${v.price} €)` : null
}

let transport
function mailer() {
  if (!process.env.SMTP_HOST) return null
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  return transport
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {{ dev?: boolean }} [opts]
 */
export async function handleEnquiry(req, res, opts = {}) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { error: 'Netinkamas užklausos metodas.' })
  }
  if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
    return send(res, 415, { error: 'Netinkamas duomenų formatas.' })
  }

  const ip =
    (process.env.TRUST_PROXY === 'true' && String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()) ||
    req.socket.remoteAddress ||
    'unknown'
  if (rateLimited(ip)) return send(res, 429, { error: 'Per daug užklausų. Pabandykite po kelių minučių.' })

  let data
  try {
    data = JSON.parse(await readBody(req))
  } catch (e) {
    return send(res, e.status ?? 400, { error: 'Nepavyko perskaityti užklausos.' })
  }

  // Robotų spąstai: tikras naudotojas šio lauko nemato
  if (clean(data.website, 200)) return send(res, 200, { ok: true })

  const enquiry = {
    name: clean(data.name, 100),
    phone: clean(data.phone, 40),
    email: clean(data.email, 200),
    vehicle: clean(data.vehicle, 120),
    message: clean(data.message, 3000),
    page: clean(data.page, 200),
  }
  if (enquiry.name.length < 2) return send(res, 422, { error: 'Įrašykite vardą.' })
  if (!enquiry.phone && !enquiry.email) return send(res, 422, { error: 'Nurodykite telefoną arba el. paštą.' })
  if (enquiry.phone && !PHONE_RE.test(enquiry.phone)) return send(res, 422, { error: 'Neteisingas telefono numeris.' })
  if (enquiry.email && !EMAIL_RE.test(enquiry.email)) return send(res, 422, { error: 'Neteisingas el. pašto adresas.' })
  if (enquiry.message.length < 5) return send(res, 422, { error: 'Parašykite žinutę.' })

  const car = await vehicleTitle(enquiry.vehicle)
  const subject = `Nauja užklausa${car ? `: ${car}` : ''} – ${enquiry.name}`
  const text = [
    `Vardas: ${enquiry.name}`,
    `Telefonas: ${enquiry.phone || '—'}`,
    `El. paštas: ${enquiry.email || '—'}`,
    `Automobilis: ${car ?? 'bendras klausimas'}`,
    `Puslapis: ${enquiry.page || '—'}`,
    '',
    enquiry.message,
  ].join('\n')

  const t = mailer()
  if (t) {
    try {
      await t.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to: process.env.MAIL_TO,
        replyTo: enquiry.email || undefined,
        subject,
        text,
      })
      return send(res, 200, { ok: true })
    } catch (e) {
      console.error('[uzklausa] el. laiško išsiųsti nepavyko:', e.message)
      return send(res, 502, { error: 'Laiško išsiųsti nepavyko.' })
    }
  }

  if (opts.dev || process.env.ENQUIRY_FILE === 'true') {
    // Kūrimo režimas: be SMTP užklausa įrašoma į failą, kad formą būtų galima išbandyti
    const file = path.join(ROOT, 'data', 'uzklausos.ndjson')
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.appendFile(file, JSON.stringify({ at: new Date().toISOString(), ...enquiry, car }) + '\n')
    console.log(`[uzklausa] įrašyta į data/uzklausos.ndjson: ${subject}`)
    return send(res, 200, { ok: true })
  }

  console.error('[uzklausa] SMTP nesukonfigūruotas – užklausa atmesta')
  return send(res, 503, { error: 'Užklausų priėmimas laikinai neveikia.' })
}

/** Laiškas pardavėjui arba įrašas į failą kūrimo režimu */
async function deliver(kind, subject, text, replyTo, record, opts) {
  const t = mailer()
  if (t) {
    await t.sendMail({ from: process.env.MAIL_FROM ?? process.env.SMTP_USER, to: process.env.MAIL_TO, replyTo, subject, text })
    return 'mail'
  }
  if (opts.dev || process.env.ENQUIRY_FILE === 'true') {
    const file = path.join(ROOT, 'data', `${kind}.ndjson`)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.appendFile(file, JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n')
    console.log(`[${kind}] įrašyta į data/${kind}.ndjson: ${subject}`)
    return 'file'
  }
  return null
}

/**
 * Rezervacijos užklausa iš krepšelio. Automobilio būsena čia NEKEIČIAMA:
 * pardavėjas paskambina, patvirtina ir tada pažymi automobilį kaip rezervuotą
 * (npm run inventory -- reserved <slug>).
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {{ dev?: boolean }} [opts]
 */
export async function handleReservation(req, res, opts = {}) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { error: 'Netinkamas užklausos metodas.' })
  }
  if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
    return send(res, 415, { error: 'Netinkamas duomenų formatas.' })
  }
  const ip =
    (process.env.TRUST_PROXY === 'true' && String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()) ||
    req.socket.remoteAddress ||
    'unknown'
  if (rateLimited(ip)) return send(res, 429, { error: 'Per daug užklausų. Pabandykite po kelių minučių.' })

  let data
  try {
    data = JSON.parse(await readBody(req))
  } catch (e) {
    return send(res, e.status ?? 400, { error: 'Nepavyko perskaityti užklausos.' })
  }
  if (clean(data.website, 200)) return send(res, 200, { ok: true })

  const r = {
    name: clean(data.name, 100),
    phone: clean(data.phone, 40),
    email: clean(data.email, 200),
    date: clean(data.date, 10),
    time: clean(data.time, 5),
    message: clean(data.message, 2000),
    vehicles: Array.isArray(data.vehicles) ? data.vehicles.slice(0, 3).map((s) => clean(s, 120)) : [],
  }
  if (r.name.length < 2) return send(res, 422, { error: 'Įrašykite vardą.' })
  if (!PHONE_RE.test(r.phone)) return send(res, 422, { error: 'Rezervacijai reikia telefono numerio.' })
  if (r.email && !EMAIL_RE.test(r.email)) return send(res, 422, { error: 'Neteisingas el. pašto adresas.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return send(res, 422, { error: 'Pasirinkite apžiūros dieną.' })
  const days = (Date.parse(r.date) - Date.parse(new Date().toISOString().slice(0, 10))) / 864e5
  if (!(days >= 0 && days <= 31)) return send(res, 422, { error: 'Apžiūros diena turi būti per artimiausias 30 dienų.' })
  if (!/^\d{1,2}\.\d{2}$/.test(r.time)) return send(res, 422, { error: 'Pasirinkite laiką.' })

  vehiclesCache ??= JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/vehicles.json'), 'utf8'))
  const cars = r.vehicles.map((s) => vehiclesCache.find((v) => v.slug === s)).filter(Boolean)
  if (!cars.length) return send(res, 422, { error: 'Nepasirinktas nė vienas automobilis.' })
  const taken = cars.filter((v) => v.status !== 'available')
  if (taken.length) {
    return send(res, 409, { error: `Jau ${taken[0].status === 'sold' ? 'parduotas' : 'rezervuotas'}: ${taken[0].make} ${taken[0].model}. Išimkite jį iš krepšelio.` })
  }

  const list = cars.map((v) => `• ${v.make} ${v.model} ${v.version}, ${v.year} – ${v.price} € (${v.slug})`)
  const subject = `Rezervacija: ${cars.map((v) => `${v.make} ${v.model}`).join(', ')} – ${r.name}`
  const text = [
    `Vardas: ${r.name}`,
    `Telefonas: ${r.phone}`,
    `El. paštas: ${r.email || '—'}`,
    `Pageidaujama apžiūra: ${r.date} ${r.time}`,
    '',
    'Automobiliai:',
    ...list,
    '',
    r.message ? `Pastabos: ${r.message}` : '',
    '',
    'Patvirtinę rezervaciją pažymėkite: npm run inventory -- reserved <slug>',
  ].join('\n')

  try {
    const how = await deliver('rezervacijos', subject, text, r.email || undefined, { ...r, cars: cars.map((v) => v.slug) }, opts)
    if (how) return send(res, 200, { ok: true })
  } catch (e) {
    console.error('[rezervacija] išsiųsti nepavyko:', e.message)
    return send(res, 502, { error: 'Laiško išsiųsti nepavyko.' })
  }
  console.error('[rezervacija] SMTP nesukonfigūruotas – rezervacija atmesta')
  return send(res, 503, { error: 'Rezervacijų priėmimas laikinai neveikia.' })
}
