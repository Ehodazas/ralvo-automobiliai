#!/usr/bin/env node
// Paprastas automobilių sąrašo valdymas iš komandinės eilutės.
//
//   npm run inventory -- list
//   npm run inventory -- sold <slug>          pažymėti kaip parduotą
//   npm run inventory -- reserved <slug>      pažymėti kaip rezervuotą
//   npm run inventory -- available <slug>     grąžinti į pardavimą
//   npm run inventory -- price <slug> <eur>   pakeisti kainą
//   npm run inventory -- photos <slug> <failas1.jpg> [failas2.jpg ...]
//   npm run inventory -- check                patikrinti duomenis ir nuotraukas
//
// Po pakeitimų paleiskite `npm run build` ir įkelkite naują versiją.
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src/data/vehicles.json')
const PUBLIC = path.join(ROOT, 'public')
const WIDTHS = [640, 1080, 1600]

const FUEL = ['benzinas', 'dyzelinas', 'hibridas', 'plug-in-hibridas', 'elektra']
const GEARBOX = ['automatine', 'mechanine']
const BODY = ['sedanas', 'universalas', 'hecbekas', 'visureigis']
const DRIVE = ['priekiniai', 'galiniai', 'visi']
const STATUS = ['available', 'reserved', 'sold']
const STATUS_LT = { available: 'parduodamas', reserved: 'rezervuotas', sold: 'parduotas' }

const load = async () => JSON.parse(await fs.readFile(DATA, 'utf8'))
const save = (list) => fs.writeFile(DATA, JSON.stringify(list, null, 2) + '\n')
const today = () => new Date().toISOString().slice(0, 10)

function find(list, slug) {
  const v = list.find((x) => x.slug === slug)
  if (!v) {
    console.error(`Automobilis „${slug}“ nerastas. Galimi: \n  ${list.map((x) => x.slug).join('\n  ')}`)
    process.exit(1)
  }
  return v
}

function validate(list) {
  const errors = []
  const slugs = new Set()
  for (const v of list) {
    const at = `[${v.slug ?? '?'}]`
    if (!/^[a-z0-9-]+$/.test(v.slug ?? '')) errors.push(`${at} slug turi būti iš mažųjų raidžių, skaičių ir brūkšnelių`)
    if (slugs.has(v.slug)) errors.push(`${at} toks slug jau yra`)
    slugs.add(v.slug)
    for (const k of ['make', 'model', 'version', 'color', 'vin', 'firstRegCountry', 'defects', 'addedAt', 'firstRegistration'])
      if (!v[k] || typeof v[k] !== 'string') errors.push(`${at} trūksta lauko „${k}“`)
    for (const k of ['year', 'price', 'mileage', 'powerKw', 'doors', 'seats'])
      if (!Number.isFinite(v[k]) || v[k] < 0) errors.push(`${at} laukas „${k}“ turi būti skaičius`)
    if (!FUEL.includes(v.fuel)) errors.push(`${at} fuel turi būti vienas iš: ${FUEL.join(', ')}`)
    if (!GEARBOX.includes(v.gearbox)) errors.push(`${at} gearbox: ${GEARBOX.join(', ')}`)
    if (!BODY.includes(v.body)) errors.push(`${at} body: ${BODY.join(', ')}`)
    if (!DRIVE.includes(v.drive)) errors.push(`${at} drive: ${DRIVE.join(', ')}`)
    if (!STATUS.includes(v.status)) errors.push(`${at} status: ${STATUS.join(', ')}`)
    if (!Array.isArray(v.description) || !v.description.length) errors.push(`${at} reikia bent vienos aprašymo pastraipos`)
    if (!Array.isArray(v.features)) errors.push(`${at} features turi būti sąrašas`)
    if (!Array.isArray(v.photos) || !v.photos.length) errors.push(`${at} reikia bent vienos nuotraukos`)
    for (const p of v.photos ?? [])
      for (const w of WIDTHS)
        if (!existsSync(path.join(PUBLIC, `${p}-${w}.webp`))) errors.push(`${at} nėra nuotraukos failo public${p}-${w}.webp`)
  }
  return errors
}

const [cmd, slug, ...rest] = process.argv.slice(2)
const list = await load()

switch (cmd) {
  case 'list': {
    for (const v of [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt))) {
      const status = STATUS_LT[v.status].padEnd(12)
      console.log(`${status} ${String(v.price).padStart(6)} €  ${v.slug}`)
    }
    break
  }
  case 'sold':
  case 'reserved':
  case 'available': {
    const v = find(list, slug)
    v.status = cmd
    if (cmd === 'sold') v.soldAt = today()
    else delete v.soldAt
    await save(list)
    console.log(`${v.make} ${v.model} (${v.slug}) dabar: ${STATUS_LT[cmd]}`)
    break
  }
  case 'price': {
    const v = find(list, slug)
    const price = Number(rest[0])
    if (!Number.isFinite(price) || price <= 0) {
      console.error('Nurodykite kainą eurais, pvz.: npm run inventory -- price ' + slug + ' 18900')
      process.exit(1)
    }
    const old = v.price
    v.price = Math.round(price)
    // Sumažinus kainą, sena rodoma perbraukta su „kaina sumažinta“ ženkliuku
    if (v.price < old) v.previousPrice = Math.max(old, v.previousPrice ?? 0)
    else delete v.previousPrice
    await save(list)
    console.log(`${v.make} ${v.model}: nauja kaina ${v.price} €${v.previousPrice ? ` (buvo ${v.previousPrice} €)` : ''}`)
    break
  }
  case 'photos': {
    if (!slug || !rest.length) {
      console.error('Naudojimas: npm run inventory -- photos <slug> <failas1.jpg> [failas2.jpg ...]')
      process.exit(1)
    }
    const { default: sharp } = await import('sharp')
    const dir = path.join(PUBLIC, 'inventory', slug)
    await fs.mkdir(dir, { recursive: true })
    const paths = []
    for (const [i, file] of rest.entries()) {
      for (const w of WIDTHS) {
        await sharp(file)
          .rotate()
          .resize({ width: w, height: Math.round((w * 2) / 3), fit: 'cover' })
          .webp({ quality: 76 })
          .toFile(path.join(dir, `${i + 1}-${w}.webp`))
      }
      paths.push(`/inventory/${slug}/${i + 1}`)
      console.log(`✓ ${file}`)
    }
    const v = list.find((x) => x.slug === slug)
    if (v) {
      v.photos = paths
      await save(list)
      console.log(`Nuotraukos priskirtos automobiliui ${slug}.`)
    } else {
      console.log(`\nĮrašykite šį sąrašą į naujo automobilio "photos" lauką:\n${JSON.stringify(paths, null, 2)}`)
    }
    break
  }
  case 'check': {
    const errors = validate(list)
    if (errors.length) {
      console.error(`Rasta klaidų: ${errors.length}\n` + errors.map((e) => '  • ' + e).join('\n'))
      process.exit(1)
    }
    const counts = Object.fromEntries(STATUS.map((s) => [STATUS_LT[s], list.filter((v) => v.status === s).length]))
    console.log(`Automobilių sąrašas tvarkingas (${list.length}):`, counts)
    break
  }
  default:
    console.log(
      'Komandos: list | sold <slug> | reserved <slug> | available <slug> | price <slug> <eur> | photos <slug> <failai...> | check',
    )
}
