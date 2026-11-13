import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { VehicleImage } from '../components/VehicleImage'
import { addressLine, site } from '../config/site'
import { BASE_URL } from '../lib/base'
import { formatKm, formatPrice } from '../lib/format'
import { gsap } from '../lib/gsap'
import { getVehicle, vehicleFullTitle, vehiclePath, vehicleTitle } from '../lib/inventory'
import { fuelLabels, gearboxLabels } from '../lib/labels'
import { cart } from '../lib/store'
import type { Vehicle } from '../types'

const OFFLINE = import.meta.env.VITE_ENQUIRY === 'off'
const PHONE_RE = /^\+?[\d\s()-]{8,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const iso = (d: Date) => d.toISOString().slice(0, 10)
const TIMES = ['9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00', '17.00']

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; cars: Vehicle[] } | { kind: 'error'; message: string }

function CartItem({ v }: { v: Vehicle }) {
  const ref = useRef<HTMLLIElement>(null)
  const unavailable = v.status !== 'available'
  function remove() {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return cart.remove(v.slug)
    gsap.to(el, { x: 40, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4, ease: 'power2.in', onComplete: () => cart.remove(v.slug) })
  }
  return (
    <li ref={ref} className="flex gap-4 overflow-hidden border-b border-line py-5 sm:gap-5">
      <Link to={vehiclePath(v)} className="zoom-frame block aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-lg sm:w-40">
        <VehicleImage base={v.photos[0]} alt="" sizes="160px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0 basis-full sm:basis-auto">
            <h2 className="text-[17px] leading-snug font-semibold sm:text-[19px]">
              <Link to={vehiclePath(v)} className="link-draw">
                {vehicleTitle(v)}
              </Link>
            </h2>
            <p className="truncate text-[14px] text-muted">
              {v.version}, {v.year} m.
            </p>
          </div>
          <p className="font-display text-[18px] font-semibold whitespace-nowrap sm:text-[20px]">{formatPrice(v.price)}</p>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {formatKm(v.mileage)} · {fuelLabels[v.fuel]} · {gearboxLabels[v.gearbox]}
        </p>
        {unavailable && (
          <p className="mt-2 text-[13px] font-semibold text-accent-dark">
            {v.status === 'sold' ? 'Automobilis jau parduotas – išimkite jį iš krepšelio.' : 'Automobilį jau rezervavo kitas pirkėjas.'}
          </p>
        )}
        <button type="button" onClick={remove} className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-2 text-[13px] font-semibold text-muted hover:text-accent-dark">
          <Icon name="trash" size={16} />
          Išimti
        </button>
      </div>
    </li>
  )
}

export default function Cart() {
  const slugs = cart.useList()
  const items = slugs.map(getVehicle).filter((v): v is Vehicle => !!v)
  const available = items.filter((v) => v.status === 'available')
  const total = available.reduce((s, v) => s + v.price, 0)
  const id = useId()
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [today, setToday] = useState('')
  const [maxDate, setMaxDate] = useState('')
  const sentRef = useRef<HTMLDivElement>(null)

  // Datos skaičiuojamos naršyklėje (statiniame HTML jų nėra)
  useEffect(() => {
    const now = new Date()
    setToday(iso(now))
    setMaxDate(iso(new Date(now.getTime() + 30 * 864e5)))
  }, [])

  useEffect(() => {
    if (state.kind === 'sent' && sentRef.current) {
      sentRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from(sentRef.current, { scale: 0.95, opacity: 0, duration: 0.6, ease: 'back.out(1.5)' })
        gsap.from(sentRef.current.querySelector('[data-check]'), { scale: 0, rotate: -90, duration: 0.7, delay: 0.15, ease: 'back.out(2)' })
      }
    }
  }, [state.kind])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      date: String(fd.get('date') ?? ''),
      time: String(fd.get('time') ?? ''),
      message: String(fd.get('message') ?? '').trim(),
      website: String(fd.get('website') ?? ''),
      vehicles: available.map((v) => v.slug),
    }
    const next: Record<string, string> = {}
    if (data.name.length < 2) next.name = 'Įrašykite savo vardą.'
    if (!PHONE_RE.test(data.phone)) next.phone = 'Rezervacijai reikia telefono numerio, pvz. +370 600 00000.'
    if (data.email && !EMAIL_RE.test(data.email)) next.email = 'Patikrinkite el. pašto adresą.'
    if (!data.date) next.date = 'Pasirinkite apžiūros dieną.'
    if (!data.vehicles.length) next.vehicles = 'Krepšelyje nėra automobilių, kuriuos būtų galima rezervuoti.'
    setErrors(next)
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus()
      return
    }
    if (OFFLINE) {
      setState({ kind: 'error', message: 'Šioje demonstracinėje versijoje rezervacija neprijungta prie serverio, duomenys niekur nesiunčiami.' })
      return
    }
    setState({ kind: 'sending' })
    try {
      const res = await fetch(`${BASE_URL}api/rezervacija`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Serveris rezervacijos nepriėmė.')
      }
      setState({ kind: 'sent', cars: available })
      cart.clear()
    } catch (err) {
      setState({ kind: 'error', message: err instanceof TypeError ? 'Nepavyko prisijungti prie serverio.' : (err as Error).message })
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="wrap py-16 lg:py-24">
        <div ref={sentRef} role="status" className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 text-center sm:p-12">
          <span data-check className="inline-flex size-16 items-center justify-center rounded-full bg-ok text-white">
            <Icon name="check" size={30} />
          </span>
          <h1 className="mt-6 text-[clamp(1.85rem,4vw,2.75rem)] leading-tight font-semibold">Rezervacijos užklausa gauta</h1>
          <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-muted">
            Darbo laiku paskambinsime ir patvirtinsime rezervaciją bei apžiūros laiką. Kol nepatvirtinome, automobilį gali rezervuoti ir kiti pirkėjai.
          </p>
          <ul className="mx-auto mt-8 max-w-md divide-y divide-line rounded-lg border border-line text-left">
            {state.cars.map((v) => (
              <li key={v.slug} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
                <span>{vehicleFullTitle(v)}</span>
                <span className="font-semibold whitespace-nowrap">{formatPrice(v.price)}</span>
              </li>
            ))}
          </ul>
          <Link to="/automobiliai" className="btn btn-primary mt-8">
            Grįžti į automobilių sąrašą
          </Link>
        </div>
      </div>
    )
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1.5 text-[13px] font-medium text-accent-dark">
        {errors[k]}
      </p>
    ) : null
  const aria = (k: string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined })

  return (
    <div className="pt-10 pb-20 lg:pt-14">
      <div className="wrap">
        <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">Krepšelis</h1>
        <p className="mt-3 max-w-2xl text-[16px] text-muted">
          Čia – automobiliai, kuriuos norite rezervuoti ir apžiūrėti. Mokėti internetu nereikia: pateikite užklausą, o mes paskambinsime ir
          patvirtinsime. Vienu metu – iki {cart.max} automobilių.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong px-6 py-20 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-surface">
              <Icon name="cart" size={26} />
            </span>
            <h2 className="mt-5 text-[24px] font-semibold">Krepšelis tuščias</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
              Automobilio kortelėje ar skelbime paspauskite krepšelio mygtuką arba „Rezervuoti automobilį“.
            </p>
            <Link to="/automobiliai" className="btn btn-primary mt-7">
              Žiūrėti visus automobilius
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <ul className="border-t border-line">
                {items.map((v) => (
                  <CartItem key={v.slug} v={v} />
                ))}
              </ul>
              <dl className="mt-6 space-y-2 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Automobilių rezervacijai</dt>
                  <dd className="font-semibold">{available.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Mokėti dabar</dt>
                  <dd className="font-semibold">0 €</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="font-semibold">Bendra automobilių vertė</dt>
                  <dd className="font-display text-[26px] font-semibold">{formatPrice(total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[13px] text-muted">
                Galutinė kaina ir atsiskaitymo būdas aptariami pasirašant sutartį. Apžiūra vyksta aikštelėje {addressLine}.
              </p>
            </div>

            <section aria-labelledby="res-title" className="lg:col-span-5">
              <div className="rounded-xl border border-line bg-white p-5 sm:p-7 lg:sticky lg:top-24">
                <h2 id="res-title" className="text-[24px] font-semibold">
                  Rezervacijos duomenys
                </h2>
                <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor={`${id}-name`} className="field-label">
                      Vardas
                    </label>
                    <input id={`${id}-name`} name="name" autoComplete="name" className="field" {...aria('name')} />
                    {err('name')}
                  </div>
                  <div>
                    <label htmlFor={`${id}-phone`} className="field-label">
                      Telefonas
                    </label>
                    <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" {...aria('phone')} />
                    {err('phone')}
                  </div>
                  <div>
                    <label htmlFor={`${id}-email`} className="field-label">
                      El. paštas <span className="font-normal text-muted">(nebūtina)</span>
                    </label>
                    <input id={`${id}-email`} name="email" type="email" autoComplete="email" className="field" {...aria('email')} />
                    {err('email')}
                  </div>
                  <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                    <div>
                      <label htmlFor={`${id}-date`} className="field-label">
                        Apžiūros diena
                      </label>
                      <input id={`${id}-date`} name="date" type="date" min={today || undefined} max={maxDate || undefined} className="field" {...aria('date')} />
                    </div>
                    <div>
                      <label htmlFor={`${id}-time`} className="field-label">
                        Laikas
                      </label>
                      <select id={`${id}-time`} name="time" className="field" defaultValue="10.00">
                        {TIMES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {err('date')}
                  <div>
                    <label htmlFor={`${id}-message`} className="field-label">
                      Pastabos <span className="font-normal text-muted">(nebūtina)</span>
                    </label>
                    <textarea id={`${id}-message`} name="message" rows={3} className="field resize-y" />
                  </div>
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Svetainė
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  {OFFLINE && state.kind !== 'error' && (
                    <p className="rounded-md bg-surface px-4 py-3 text-[13px] text-muted">Demonstracinė versija: forma tikrina laukus, bet rezervacijos nesiunčia.</p>
                  )}
                  {err('vehicles')}
                  {state.kind === 'error' && (
                    <div role="alert" className="rounded-md border border-accent/40 bg-accent-soft px-4 py-3 text-[14px] text-accent-dark">
                      <p className="font-semibold">Rezervacija neišsiųsta. {state.message}</p>
                      {site.phone && (
                        <p className="mt-1">
                          Paskambinkite{' '}
                          <a className="font-semibold underline" href={`tel:${site.phoneHref}`}>
                            {site.phone}
                          </a>{' '}
                          ir rezervuosime telefonu.
                        </p>
                      )}
                    </div>
                  )}

                  <button type="submit" disabled={state.kind === 'sending' || !available.length} className="btn btn-accent btn-shine w-full disabled:cursor-not-allowed disabled:opacity-60">
                    <Icon name="calendar" size={18} />
                    {state.kind === 'sending' ? 'Siunčiama…' : `Rezervuoti ${available.length > 1 ? `${available.length} automobilius` : 'automobilį'}`}
                  </button>
                  <p className="text-[13px] leading-snug text-muted">
                    Rezervacija įsigalioja, kai ją patvirtiname telefonu. Duomenis naudosime tik šiai rezervacijai.{' '}
                    <Link to="/privatumo-politika" className="underline underline-offset-2 hover:text-ink">
                      Privatumo politika
                    </Link>
                  </p>
                </form>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
