import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { formatKm, formatPrice } from '../lib/format'
import { gsap } from '../lib/gsap'
import { activeVehicles, applyFilters, emptyFilters, vehiclePath, vehicles, vehicleTitle } from '../lib/inventory'
import { fuelLabels } from '../lib/labels'
import { asset } from '../lib/base'
import type { Vehicle } from '../types'
import { Icon } from './Icon'

/** Greitos paieškos nuorodos (kaip „quick searches“ kitose svetainėse) */
export const quickSearches = [
  { label: 'Automatinė pavarų dėžė', to: '/automobiliai?pavaros=automatine' },
  { label: 'Hibridai ir elektra', to: '/automobiliai?kuras=hibridas,plug-in-hibridas,elektra' },
  { label: 'Visureigiai', to: '/automobiliai?kebulas=visureigis' },
  { label: 'Universalai', to: '/automobiliai?kebulas=universalas' },
  { label: 'Iki 20 000 €', to: '/automobiliai?kaina_iki=20000' },
  { label: '4x4', to: '/automobiliai?varantieji=visi' },
]

export function useSearch(q: string, limit = 6) {
  return useMemo(() => {
    if (!q.trim()) return { results: activeVehicles().slice(0, 4), total: 0, empty: true }
    const all = applyFilters(vehicles, { ...emptyFilters, q }, 'naujausi')
    return { results: all.slice(0, limit), total: all.length, empty: false }
  }, [q, limit])
}

export function ResultRow({ v, active, id, onPick }: { v: Vehicle; active: boolean; id: string; onPick?: () => void }) {
  return (
    <li role="option" id={id} aria-selected={active}>
      <Link
        to={vehiclePath(v)}
        onClick={onPick}
        className={`flex items-center gap-4 rounded-md p-2 transition-colors ${active ? 'bg-surface' : 'hover:bg-surface'}`}
      >
        <img src={asset(`${v.photos[0]}-640.webp`)} alt="" className="aspect-[3/2] w-20 shrink-0 rounded object-cover" loading="lazy" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">
            {vehicleTitle(v)} <span className="font-normal text-muted">{v.version}</span>
          </span>
          <span className="block text-[13px] text-muted">
            {v.year} · {formatKm(v.mileage)} · {fuelLabels[v.fuel]}
            {v.status !== 'available' && <> · <span className="font-semibold text-accent-dark">{v.status === 'sold' ? 'parduotas' : 'rezervuotas'}</span></>}
          </span>
        </span>
        <span className="font-display text-[16px] font-semibold whitespace-nowrap">{formatPrice(v.price)}</span>
      </Link>
    </li>
  )
}

const OPEN_EVENT = 'ralvo:search'
export const openSearch = (q = '') => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: q }))

export function SearchOverlay() {
  const dialog = useRef<HTMLDialogElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const { results, total, empty } = useSearch(q)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const listId = useId()

  const close = () => dialog.current?.close()

  useEffect(() => {
    const open = (e: Event) => {
      const d = dialog.current
      if (!d || d.open) return
      setQ((e as CustomEvent<string>).detail ?? '')
      setActive(0)
      d.showModal()
      requestAnimationFrame(() => input.current?.focus())
      if (panel.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(panel.current, { y: -16, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' })
        gsap.fromTo(panel.current.querySelectorAll('[data-stagger]'), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, delay: 0.08 })
      }
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t.closest('input, textarea, select, [contenteditable]')
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener(OPEN_EVENT, open)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener(OPEN_EVENT, open)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => close(), [pathname])
  useEffect(() => setActive(0), [q])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active] && (!empty || q === '')) navigate(vehiclePath(results[active]))
      else navigate(`/automobiliai?q=${encodeURIComponent(q.trim())}`)
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Automobilių paieška"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="flex h-full items-start justify-center px-3 pt-3 sm:px-6 sm:pt-[12vh]" onClick={(e) => e.target === e.currentTarget && close()}>
        <div ref={panel} className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-[0_40px_100px_-30px_rgb(0_0_0/0.6)]">
          <div className="flex items-center gap-3 border-b border-line px-4 sm:px-5">
            <Icon name="search" size={22} className="text-muted" />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Markė, modelis, metai ar spalva"
              aria-label="Paieška"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              className="min-h-16 flex-1 bg-transparent text-[18px] outline-none placeholder:text-muted/70"
            />
            <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[12px] text-muted sm:block">Esc</kbd>
            <button type="button" onClick={close} className="inline-flex size-10 items-center justify-center rounded-md sm:hidden" aria-label="Uždaryti paiešką">
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-3 sm:p-4">
            {empty && (
              <div data-stagger className="mb-4">
                <p className="px-2 text-[12px] font-semibold text-muted">Greita paieška</p>
                <ul className="mt-2 flex flex-wrap gap-2 px-2">
                  {quickSearches.map((s) => (
                    <li key={s.to}>
                      <Link to={s.to} onClick={close} className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-[13px] font-semibold transition hover:bg-ink hover:text-white">
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p data-stagger className="px-2 pb-2 text-[12px] font-semibold text-muted">
              {empty ? 'Naujausi automobiliai' : total ? `Rasta: ${total}` : `Pagal „${q}“ nieko nerasta`}
            </p>
            <ul id={listId} role="listbox" aria-label="Rezultatai">
              {results.map((v, i) => (
                <ResultRow key={v.slug} v={v} id={`${listId}-${i}`} active={i === active} onPick={close} />
              ))}
            </ul>
            {!empty && (
              <Link
                to={`/automobiliai?q=${encodeURIComponent(q.trim())}`}
                onClick={close}
                className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-md border border-line text-[14px] font-semibold hover:border-ink"
              >
                Rodyti visus rezultatus sąraše
                <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </dialog>
  )
}
