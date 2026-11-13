import data from '../data/vehicles.json'
import type { Body, Drive, Fuel, Gearbox, Vehicle } from '../types'
import { bodyLabels, driveLabels, fuelLabels, gearboxLabels } from './labels'

export const vehicles = data as Vehicle[]

export const vehicleTitle = (v: Vehicle) => `${v.make} ${v.model}`
export const vehicleFullTitle = (v: Vehicle) => `${v.make} ${v.model} ${v.version}, ${v.year}`
export const vehiclePath = (v: Vehicle) => `/automobiliai/${v.slug}`

export const getVehicle = (slug: string) => vehicles.find((v) => v.slug === slug)

/** Parduotus rodome tik juos įjungus. Naujausi viršuje. */
export const activeVehicles = () =>
  vehicles.filter((v) => v.status !== 'sold').sort((a, b) => b.addedAt.localeCompare(a.addedAt))

export function similarVehicles(v: Vehicle, count = 3) {
  return activeVehicles()
    .filter((o) => o.slug !== v.slug)
    .map((o) => ({
      o,
      score:
        (o.body === v.body ? 3 : 0) +
        (o.make === v.make ? 2 : 0) +
        (Math.abs(o.price - v.price) < 6000 ? 2 : 0) +
        (o.fuel === v.fuel ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.o)
}

// ---- Filtrai ----

export interface Filters {
  q: string
  marke: string
  modelis: string
  kainaNuo: number | null
  kainaIki: number | null
  metaiNuo: number | null
  metaiIki: number | null
  ridaIki: number | null
  kuras: Fuel[]
  pavaros: Gearbox[]
  kebulas: Body[]
  varantieji: Drive[]
  parduoti: boolean
}

export type SortKey = 'naujausi' | 'kaina-didejimo' | 'kaina-mazejimo' | 'metai' | 'rida'

export const sortLabels: Record<SortKey, string> = {
  naujausi: 'Naujausi skelbimai',
  'kaina-didejimo': 'Kaina: nuo mažiausios',
  'kaina-mazejimo': 'Kaina: nuo didžiausios',
  metai: 'Metai: naujausi',
  rida: 'Rida: mažiausia',
}

export const emptyFilters: Filters = {
  q: '',
  marke: '',
  modelis: '',
  kainaNuo: null,
  kainaIki: null,
  metaiNuo: null,
  metaiIki: null,
  ridaIki: null,
  kuras: [],
  pavaros: [],
  kebulas: [],
  varantieji: [],
  parduoti: false,
}

const num = (s: string | null) => {
  if (!s) return null
  const n = Number(s.replace(/\s/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}
const list = <T extends string>(s: string | null) => (s ? (s.split(',').filter(Boolean) as T[]) : [])

export function filtersFromParams(p: URLSearchParams): Filters {
  return {
    q: p.get('q') ?? '',
    marke: p.get('marke') ?? '',
    modelis: p.get('modelis') ?? '',
    kainaNuo: num(p.get('kaina_nuo')),
    kainaIki: num(p.get('kaina_iki')),
    metaiNuo: num(p.get('metai_nuo')),
    metaiIki: num(p.get('metai_iki')),
    ridaIki: num(p.get('rida_iki')),
    kuras: list<Fuel>(p.get('kuras')),
    pavaros: list<Gearbox>(p.get('pavaros')),
    kebulas: list<Body>(p.get('kebulas')),
    varantieji: list<Drive>(p.get('varantieji')),
    parduoti: p.get('parduoti') === '1',
  }
}

export function paramsFromFilters(f: Filters, sort: SortKey): URLSearchParams {
  const p = new URLSearchParams()
  const set = (k: string, v: string | number | null | undefined) => {
    if (v !== null && v !== undefined && v !== '') p.set(k, String(v))
  }
  set('q', f.q.trim())
  set('marke', f.marke)
  set('modelis', f.modelis)
  set('kaina_nuo', f.kainaNuo)
  set('kaina_iki', f.kainaIki)
  set('metai_nuo', f.metaiNuo)
  set('metai_iki', f.metaiIki)
  set('rida_iki', f.ridaIki)
  set('kuras', f.kuras.join(','))
  set('pavaros', f.pavaros.join(','))
  set('kebulas', f.kebulas.join(','))
  set('varantieji', f.varantieji.join(','))
  if (f.parduoti) p.set('parduoti', '1')
  if (sort !== 'naujausi') p.set('rikiuoti', sort)
  return p
}

export const sortFromParams = (p: URLSearchParams): SortKey => {
  const s = p.get('rikiuoti') as SortKey | null
  return s && s in sortLabels ? s : 'naujausi'
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function applyFilters(all: Vehicle[], f: Filters, sort: SortKey): Vehicle[] {
  const q = normalize(f.q.trim())
  const out = all.filter((v) => {
    if (!f.parduoti && v.status === 'sold') return false
    if (f.marke && v.make !== f.marke) return false
    if (f.modelis && v.model !== f.modelis) return false
    if (f.kainaNuo && v.price < f.kainaNuo) return false
    if (f.kainaIki && v.price > f.kainaIki) return false
    if (f.metaiNuo && v.year < f.metaiNuo) return false
    if (f.metaiIki && v.year > f.metaiIki) return false
    if (f.ridaIki && v.mileage > f.ridaIki) return false
    if (f.kuras.length && !f.kuras.includes(v.fuel)) return false
    if (f.pavaros.length && !f.pavaros.includes(v.gearbox)) return false
    if (f.kebulas.length && !f.kebulas.includes(v.body)) return false
    if (f.varantieji.length && !f.varantieji.includes(v.drive)) return false
    if (q) {
      const hay = normalize(
        `${v.make} ${v.model} ${v.version} ${v.year} ${v.color} ${fuelLabels[v.fuel]} ${gearboxLabels[v.gearbox]} ${bodyLabels[v.body]} ${driveLabels[v.drive]}`,
      )
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false
    }
    return true
  })
  const sorters: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
    naujausi: (a, b) => b.addedAt.localeCompare(a.addedAt),
    'kaina-didejimo': (a, b) => a.price - b.price,
    'kaina-mazejimo': (a, b) => b.price - a.price,
    metai: (a, b) => b.year - a.year || a.mileage - b.mileage,
    rida: (a, b) => a.mileage - b.mileage,
  }
  // Parduoti visada sąrašo gale
  return out.sort((a, b) => Number(a.status === 'sold') - Number(b.status === 'sold') || sorters[sort](a, b))
}

export const countActiveFilters = (f: Filters) =>
  [f.q, f.marke, f.modelis, f.kainaNuo, f.kainaIki, f.metaiNuo, f.metaiIki, f.ridaIki].filter(Boolean).length +
  f.kuras.length +
  f.pavaros.length +
  f.kebulas.length +
  f.varantieji.length +
  (f.parduoti ? 1 : 0)

export const makes = () => [...new Set(vehicles.map((v) => v.make))].sort((a, b) => a.localeCompare(b, 'lt'))
export const modelsFor = (make: string) =>
  [...new Set(vehicles.filter((v) => v.make === make).map((v) => v.model))].sort((a, b) => a.localeCompare(b, 'lt'))

export const yearRange = () => {
  const ys = vehicles.map((v) => v.year)
  return { min: Math.min(...ys), max: Math.max(...ys) }
}
