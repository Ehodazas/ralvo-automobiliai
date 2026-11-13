import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterPanel } from '../components/FilterPanel'
import { Icon } from '../components/Icon'
import { VehicleCard } from '../components/VehicleCard'
import { carsCount, carsCountAcc, formatNumber } from '../lib/format'
import {
  applyFilters,
  countActiveFilters,
  filtersFromParams,
  paramsFromFilters,
  sortFromParams,
  sortLabels,
  vehicles,
  type Filters,
  type SortKey,
} from '../lib/inventory'
import { bodyLabels, driveLabels, fuelLabels, gearboxLabels } from '../lib/labels'
import { cityLocative } from '../lib/seo'
import { site } from '../config/site'

function chipsFor(f: Filters): { key: string; label: string; patch: Partial<Filters> }[] {
  const chips: { key: string; label: string; patch: Partial<Filters> }[] = []
  if (f.q) chips.push({ key: 'q', label: `„${f.q}“`, patch: { q: '' } })
  if (f.marke) chips.push({ key: 'marke', label: f.marke, patch: { marke: '', modelis: '' } })
  if (f.modelis) chips.push({ key: 'modelis', label: f.modelis, patch: { modelis: '' } })
  if (f.kainaNuo) chips.push({ key: 'kn', label: `nuo ${formatNumber(f.kainaNuo)} €`, patch: { kainaNuo: null } })
  if (f.kainaIki) chips.push({ key: 'ki', label: `iki ${formatNumber(f.kainaIki)} €`, patch: { kainaIki: null } })
  if (f.metaiNuo) chips.push({ key: 'mn', label: `nuo ${f.metaiNuo} m.`, patch: { metaiNuo: null } })
  if (f.metaiIki) chips.push({ key: 'mi', label: `iki ${f.metaiIki} m.`, patch: { metaiIki: null } })
  if (f.ridaIki) chips.push({ key: 'r', label: `rida iki ${formatNumber(f.ridaIki)} km`, patch: { ridaIki: null } })
  f.kuras.forEach((k) => chips.push({ key: `f-${k}`, label: fuelLabels[k], patch: { kuras: f.kuras.filter((x) => x !== k) } }))
  f.pavaros.forEach((k) => chips.push({ key: `g-${k}`, label: gearboxLabels[k], patch: { pavaros: f.pavaros.filter((x) => x !== k) } }))
  f.kebulas.forEach((k) => chips.push({ key: `b-${k}`, label: bodyLabels[k], patch: { kebulas: f.kebulas.filter((x) => x !== k) } }))
  f.varantieji.forEach((k) => chips.push({ key: `d-${k}`, label: `Varantieji: ${driveLabels[k].toLowerCase()}`, patch: { varantieji: f.varantieji.filter((x) => x !== k) } }))
  if (f.parduoti) chips.push({ key: 'sold', label: 'Su parduotais', patch: { parduoti: false } })
  return chips
}

export default function Inventory() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(params), [params])
  const sort = sortFromParams(params)
  const results = useMemo(() => applyFilters(vehicles, filters, sort), [filters, sort])
  const active = countActiveFilters(filters)
  const drawer = useRef<HTMLDialogElement>(null)

  // Teksto paieška: vietinė būsena, kad URL nesikeistų po kiekvieno klavišo
  const [q, setQ] = useState(filters.q)
  useEffect(() => setQ(filters.q), [filters.q])

  const update = (patch: Partial<Filters>, nextSort: SortKey = sort) => {
    const next = { ...filters, ...patch }
    setParams(paramsFromFilters(next, nextSort), { replace: true, preventScrollReset: true })
  }

  useEffect(() => {
    if (q === filters.q) return
    const t = setTimeout(() => update({ q }), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const onPanelChange = (patch: Partial<Filters>) => {
    if ('q' in patch) setQ(patch.q ?? '')
    const { q: _ignored, ...rest } = patch
    if (Object.keys(rest).length) update(rest)
  }

  const reset = () => {
    setQ('')
    setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })
  }

  const chips = chipsFor(filters)
  const panelFilters = { ...filters, q }

  return (
    <div className="pb-20">
      <section className="border-b border-line pt-10 pb-8 lg:pt-14 lg:pb-10" aria-labelledby="inv-title">
        <div className="wrap flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 id="inv-title" className="text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">
              Parduodami automobiliai
            </h1>
            <p className="mt-3 text-[16px] text-muted">
              Naudoti automobiliai {cityLocative(site.city)}. Atnaujinama, kai automobilis parduodamas arba atvežamas naujas.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap grid gap-10 pt-8 lg:grid-cols-[280px_1fr] lg:gap-12 lg:pt-10">
        {/* Kompiuteryje – šoninis filtrų stulpelis */}
        <aside className="hidden lg:block" aria-label="Filtrai">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2 pb-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold">Filtrai</h2>
              {active > 0 && (
                <button type="button" onClick={reset} className="min-h-11 text-[14px] font-semibold text-accent-dark hover:underline">
                  Išvalyti
                </button>
              )}
            </div>
            <FilterPanel filters={panelFilters} onChange={onPanelChange} />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold" role="status" aria-live="polite">
              Rasta: {carsCount(results.length)}
            </p>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button
                type="button"
                onClick={() => drawer.current?.showModal()}
                className="btn btn-secondary flex-1 lg:hidden"
                aria-haspopup="dialog"
              >
                <Icon name="filter" size={18} />
                Filtrai{active > 0 ? ` (${active})` : ''}
              </button>
              <label htmlFor="sort" className="sr-only">
                Rikiuoti
              </label>
              <select id="sort" className="field flex-1 sm:w-60 sm:flex-none" value={sort} onChange={(e) => update({}, e.target.value as SortKey)}>
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {sortLabels[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Pasirinkti filtrai">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => onPanelChange(c.patch)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line-strong bg-white pr-2.5 pl-3.5 text-[13px] font-semibold transition hover:border-ink"
                    aria-label={`Pašalinti filtrą: ${c.label}`}
                  >
                    {c.label}
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={reset} className="inline-flex min-h-9 items-center px-2 text-[13px] font-semibold text-accent-dark hover:underline">
                  Išvalyti visus
                </button>
              </li>
            </ul>
          )}

          {results.length > 0 ? (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v, i) => (
                <li key={v.slug}>
                  <VehicleCard vehicle={v} priority={i < 3} headingLevel="h2" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-line-strong px-6 py-16 text-center">
              <h2 className="text-[22px] font-semibold">Pagal šiuos filtrus automobilių nėra</h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
                Pabandykite pašalinti kelis filtrus arba išplėsti kainos ir metų ribas.
              </p>
              <button type="button" onClick={reset} className="btn btn-primary mt-6">
                Išvalyti filtrus
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Telefone – filtrai atskirame lange */}
      <dialog
        ref={drawer}
        aria-labelledby="drawer-title"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 lg:hidden"
        onClick={(e) => e.target === e.currentTarget && drawer.current?.close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="drawer-title" className="text-[18px] font-semibold">
              Filtrai
            </h2>
            <button
              type="button"
              onClick={() => drawer.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-md"
              aria-label="Uždaryti filtrus"
            >
              <Icon name="close" size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterPanel filters={panelFilters} onChange={onPanelChange} />
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-line bg-white px-5 py-4">
            <button type="button" onClick={reset} className="btn btn-secondary">
              Išvalyti
            </button>
            <button type="button" onClick={() => drawer.current?.close()} className="btn btn-primary">
              Rodyti {carsCountAcc(results.length)}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
