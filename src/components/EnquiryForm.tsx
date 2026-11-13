import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { BASE_URL } from '../lib/base'
import { activeVehicles, vehicleFullTitle } from '../lib/inventory'
import type { Vehicle } from '../types'
import { Icon } from './Icon'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

interface Errors {
  name?: string
  contact?: string
  message?: string
}

interface Props {
  /** Jei forma rodoma automobilio puslapyje – automobilis parenkamas automatiškai */
  vehicle?: Vehicle
  compact?: boolean
}

/** Build be serverio (VITE_ENQUIRY=off): forma tikrina laukus, bet duomenų nesiunčia */
const OFFLINE = import.meta.env.VITE_ENQUIRY === 'off'

const EMAIL_RE =/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s()-]{8,}$/

export function EnquiryForm({ vehicle, compact }: Props) {
  const id = useId()
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [errors, setErrors] = useState<Errors>({})
  const options = activeVehicles()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      vehicle: String(fd.get('vehicle') ?? ''),
      message: String(fd.get('message') ?? '').trim(),
      website: String(fd.get('website') ?? ''), // apsauga nuo robotų
      page: window.location.pathname,
    }

    const next: Errors = {}
    if (data.name.length < 2) next.name = 'Įrašykite savo vardą.'
    if (!data.phone && !data.email) next.contact = 'Nurodykite telefoną arba el. paštą, kad galėtume atsakyti.'
    else if (data.phone && !PHONE_RE.test(data.phone)) next.contact = 'Patikrinkite telefono numerį, pvz. +370 600 00000.'
    else if (data.email && !EMAIL_RE.test(data.email)) next.contact = 'Patikrinkite el. pašto adresą.'
    if (data.message.length < 5) next.message = 'Parašykite, kas jus domina.'
    setErrors(next)
    if (Object.keys(next).length) {
      const firstKey = Object.keys(next)[0]
      form.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)?.focus()
      return
    }

    if (OFFLINE) {
      // Statinė versija (pvz. GitHub Pages): serverio nėra, todėl nieko nesiunčiame
      setState({ kind: 'error', message: 'Šioje demonstracinėje versijoje forma neprijungta prie serverio, duomenys niekur nesiunčiami.' })
      return
    }

    setState({ kind: 'sending' })
    try {
      const res = await fetch(`${BASE_URL}api/uzklausa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Serveris užklausos nepriėmė.')
      }
      setState({ kind: 'sent' })
      form.reset()
    } catch (err) {
      const msg = err instanceof TypeError ? 'Nepavyko prisijungti prie serverio.' : (err as Error).message
      setState({ kind: 'error', message: msg })
    }
  }

  if (state.kind === 'sent') {
    return (
      <div role="status" className="rounded-lg border border-line bg-white p-6 sm:p-8">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-ok text-white">
          <Icon name="check" size={20} />
        </span>
        <h3
          tabIndex={-1}
          ref={(el) => {
            if (el) {
              el.focus({ preventScroll: true })
              el.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }
          }}
          className="mt-4 text-[22px] font-semibold outline-none"
        >
          Užklausa išsiųsta
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Gavome jūsų žinutę ir atsakysime darbo laiku nurodytu telefonu arba el. paštu.
        </p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => setState({ kind: 'idle' })}>
          Rašyti dar vieną užklausą
        </button>
      </div>
    )
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1.5 text-[13px] font-medium text-accent-dark">
        {errors[k]}
      </p>
    ) : null

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5" aria-describedby={`${id}-privacy`}>
      <div className={`grid gap-5 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div className={compact ? '' : 'sm:col-span-2'}>
          <label htmlFor={`${id}-name`} className="field-label">
            Vardas
          </label>
          <input
            id={`${id}-name`}
            name="name"
            data-field="name"
            autoComplete="name"
            className="field"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
          />
          {err('name')}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="field-label">
            Telefonas
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            data-field="contact"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? `${id}-contact-err` : `${id}-contact-hint`}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="field-label">
            El. paštas
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            className="field"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? `${id}-contact-err` : `${id}-contact-hint`}
          />
        </div>
        <div className={compact ? '' : 'sm:col-span-2'}>
          {errors.contact ? (
            err('contact')
          ) : (
            <p id={`${id}-contact-hint`} className="-mt-2 text-[13px] text-muted">
              Užtenka vieno: telefono arba el. pašto.
            </p>
          )}
        </div>
        {vehicle ? (
          <input type="hidden" name="vehicle" value={vehicle.slug} />
        ) : (
          <div className={compact ? '' : 'sm:col-span-2'}>
            <label htmlFor={`${id}-vehicle`} className="field-label">
              Automobilis <span className="font-normal text-muted">(nebūtina)</span>
            </label>
            <select id={`${id}-vehicle`} name="vehicle" className="field" defaultValue="">
              <option value="">Bendras klausimas</option>
              {options.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {vehicleFullTitle(v)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={compact ? '' : 'sm:col-span-2'}>
          <label htmlFor={`${id}-message`} className="field-label">
            Žinutė
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            data-field="message"
            rows={compact ? 4 : 5}
            className="field resize-y"
            defaultValue={vehicle ? `Sveiki, domina ${vehicleFullTitle(vehicle)}. Norėčiau atvykti apžiūrėti.` : ''}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${id}-message-err` : undefined}
          />
          {err('message')}
        </div>
      </div>

      {/* Laukas, kurio žmonės nemato: jį užpildo tik robotai */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Svetainė
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {OFFLINE && state.kind !== 'error' && (
        <p className="rounded-md bg-surface px-4 py-3 text-[13px] text-muted">
          Demonstracinė versija: forma tikrina laukus, bet užklausos nesiunčia.
        </p>
      )}

      {state.kind === 'error' && (
        <div role="alert" className="rounded-md border border-accent/40 bg-accent-soft px-4 py-3 text-[14px] text-accent-dark">
          <p className="font-semibold">Užklausa neišsiųsta. {state.message}</p>
          {site.phone && (
            <p className="mt-1">
              Pabandykite dar kartą arba paskambinkite{' '}
              <a className="font-semibold underline" href={`tel:${site.phoneHref}`}>
                {site.phone}
              </a>
              .
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-accent w-full sm:w-auto" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? 'Siunčiama…' : 'Siųsti užklausą'}
        </button>
        <p id={`${id}-privacy`} className="text-[13px] leading-snug text-muted sm:max-w-xs">
          Duomenis naudosime tik atsakyti į užklausą.{' '}
          <Link to="/privatumo-politika" className="underline underline-offset-2 hover:text-ink">
            Privatumo politika
          </Link>
        </p>
      </div>
    </form>
  )
}
