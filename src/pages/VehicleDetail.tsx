import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EnquiryForm } from '../components/EnquiryForm'
import { Gallery } from '../components/Gallery'
import { Icon, type IconName } from '../components/Icon'
import { StatusBadge } from '../components/StatusBadge'
import { VehicleCard } from '../components/VehicleCard'
import { site } from '../config/site'
import { formatEngine, formatKm, formatMonth, formatPower, formatPrice } from '../lib/format'
import { getVehicle, similarVehicles, vehicleTitle } from '../lib/inventory'
import { bodyLabels, driveLabels, fuelLabels, gearboxLabels } from '../lib/labels'
import NotFound from './NotFound'

export default function VehicleDetail() {
  const { slug = '' } = useParams()
  const v = getVehicle(slug)
  const [copied, setCopied] = useState(false)
  if (!v) return <NotFound />

  const sold = v.status === 'sold'
  const reserved = v.status === 'reserved'
  const title = vehicleTitle(v)

  const keyFacts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'calendar', label: 'Metai', value: String(v.year) },
    { icon: 'gauge', label: 'Rida', value: formatKm(v.mileage) },
    { icon: 'fuel', label: 'Kuras', value: fuelLabels[v.fuel] },
    { icon: 'gearbox', label: 'Pavarų dėžė', value: gearboxLabels[v.gearbox] },
    { icon: 'bolt', label: 'Galia', value: `${v.powerKw} kW` },
  ]

  const specs: [string, string | null][] = [
    ['Pirma registracija', formatMonth(v.firstRegistration)],
    ['Rida', formatKm(v.mileage)],
    ['Kuro tipas', fuelLabels[v.fuel]],
    ['Pavarų dėžė', gearboxLabels[v.gearbox]],
    ['Variklis', formatEngine(v.engineCc)],
    ['Galia', formatPower(v.powerKw)],
    ['Baterijos talpa', v.batteryKwh ? `${String(v.batteryKwh).replace('.', ',')} kWh` : null],
    ['Kėbulo tipas', bodyLabels[v.body]],
    ['Durų skaičius', String(v.doors)],
    ['Sėdimų vietų skaičius', String(v.seats)],
    ['Varantieji ratai', driveLabels[v.drive]],
    ['Spalva', v.color],
    ['Tech. apžiūra iki', v.inspectionUntil ? formatMonth(v.inspectionUntil) : null],
    ['Kėbulo numeris (VIN)', v.vin],
    ['Euro standartas', v.euroStandard],
    ['CO₂ emisija', v.co2 !== null ? `${v.co2} g/km` : null],
    ['Pirmosios registracijos šalis', v.firstRegCountry],
    ['Defektai', v.defects],
  ]

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title}, ${v!.year}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      /* naudotojas atšaukė */
    }
  }

  const similar = similarVehicles(v)

  return (
    <div className="pb-24 lg:pb-20">
      <div className="wrap pt-6 lg:pt-8">
        <nav aria-label="Naršymo kelias">
          <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-muted">
            <li>
              <Link to="/" className="link-draw hover:text-ink">
                Pradžia
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/automobiliai" className="link-draw hover:text-ink">
                Automobiliai
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>

        {sold && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg bg-ink px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px]">
              <strong className="font-semibold">Šis automobilis jau parduotas.</strong>{' '}
              <span className="text-white/70">Skelbimą paliekame, kad matytumėte, kokius automobilius parduodame.</span>
            </p>
            <Link to="/automobiliai" className="btn btn-ghost-light min-h-11 shrink-0">
              Žiūrėti parduodamus
            </Link>
          </div>
        )}
      </div>

      <div className="wrap mt-6 grid gap-10 lg:mt-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <Gallery photos={v.photos} alt={`${title}, ${v.year} m.`} dimmed={sold} />
        </div>

        <aside className="lg:col-span-5 xl:col-span-4" aria-label="Kaina ir kontaktai">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StatusBadge status={v.status} className="mb-3" />
                <h1 className="text-[clamp(1.85rem,3.2vw,2.6rem)] leading-[1.05] font-semibold tracking-[-0.02em]">{title}</h1>
                <p className="mt-1.5 text-[16px] text-muted">
                  {v.version}, {v.year} m.
                </p>
              </div>
            </div>

            <p className={`mt-6 font-display text-[40px] leading-none font-semibold tracking-tight ${sold ? 'text-muted line-through decoration-2' : ''}`}>
              <span className="sr-only">Kaina: </span>
              {formatPrice(v.price)}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {keyFacts.map((k) => (
                <div key={k.label} className="bg-white p-3.5">
                  <dt className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                    <Icon name={k.icon} size={15} />
                    {k.label}
                  </dt>
                  <dd className="mt-1 text-[15px] font-semibold">{k.value}</dd>
                </div>
              ))}
              <div className="bg-white p-3.5">
                <dt className="text-[12px] font-semibold text-muted">Kėbulas</dt>
                <dd className="mt-1 text-[15px] font-semibold">{bodyLabels[v.body].split(' /')[0]}</dd>
              </div>
            </dl>

            {!sold && (
              <div className="mt-6 grid gap-3">
                {reserved && (
                  <p className="rounded-md bg-accent-soft px-4 py-3 text-[14px] text-accent-dark">
                    Automobilis rezervuotas. Parašykite – pranešime, jei rezervacija bus atšaukta.
                  </p>
                )}
                <a href="#uzklausa" className="btn btn-accent w-full">
                  Rašyti užklausą
                </a>
                {site.phone && site.phoneHref && (
                  <a href={`tel:${site.phoneHref}`} className="btn btn-secondary w-full">
                    <Icon name="phone" size={18} />
                    Skambinti {site.phone}
                  </a>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={share}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-muted hover:text-ink"
            >
              <Icon name="link" size={17} />
              <span aria-live="polite">{copied ? 'Nuoroda nukopijuota' : 'Dalintis skelbimu'}</span>
            </button>
          </div>
        </aside>
      </div>

      <div className="wrap mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-14 lg:col-span-7 xl:col-span-8">
          <section aria-labelledby="desc-title">
            <h2 id="desc-title" className="text-[28px] font-semibold">
              Aprašymas
            </h2>
            <div className="mt-4 max-w-2xl space-y-4 text-[16px] leading-relaxed text-charcoal">
              {v.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="spec-title">
            <h2 id="spec-title" className="text-[28px] font-semibold">
              Techniniai duomenys
            </h2>
            <dl className="mt-5 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {specs
                .filter((s): s is [string, string] => !!s[1])
                .map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-line py-3.5 text-[15px]">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-semibold">{val}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-3 text-[13px] text-muted">Pilną VIN numerį atsiųsime paprašius – galėsite patikrinti automobilio istoriją.</p>
          </section>

          <section aria-labelledby="feat-title">
            <h2 id="feat-title" className="text-[28px] font-semibold">
              Komplektacija
            </h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              {v.features.map((g) => (
                <div key={g.group}>
                  <h3 className="text-[16px] font-semibold">{g.group}</h3>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-[15px] text-charcoal">
                        <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {!sold && (
          <section id="uzklausa" aria-labelledby="enq-title" className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-lg border border-line bg-white p-5 sm:p-7">
              <h2 id="enq-title" className="text-[24px] font-semibold">
                Užklausa dėl automobilio
              </h2>
              <p className="mt-2 mb-6 text-[15px] text-muted">
                {title}, {v.year} m. · {formatPrice(v.price)}
              </p>
              <EnquiryForm vehicle={v} compact />
            </div>
          </section>
        )}
      </div>

      {similar.length > 0 && (
        <section className="mt-20 border-t border-line pt-16 lg:mt-28" aria-labelledby="similar-title">
          <div className="wrap">
            <h2 id="similar-title" className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold">
              Panašūs automobiliai
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <li key={s.slug}>
                  <VehicleCard vehicle={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Telefone – kaina ir veiksmai visada po ranka */}
      {!sold && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md lg:hidden">
          <div className="wrap flex items-center gap-3 py-3">
            <p className="mr-auto font-display text-[20px] font-semibold">{formatPrice(v.price)}</p>
            {site.phoneHref && (
              <a href={`tel:${site.phoneHref}`} className="btn btn-secondary min-h-11 px-3.5" aria-label={`Skambinti ${site.phone}`}>
                <Icon name="phone" size={18} />
              </a>
            )}
            <a href="#uzklausa" className="btn btn-accent min-h-11">
              Užklausa
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
