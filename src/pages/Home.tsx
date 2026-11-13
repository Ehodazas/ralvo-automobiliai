import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { VehicleCard } from '../components/VehicleCard'
import { VehicleImage } from '../components/VehicleImage'
import { addressLine, mapHref, site } from '../config/site'
import { carsCount, carsCountAcc, formatNumber, formatPrice } from '../lib/format'
import { gsap, markEntered, useGSAP } from '../lib/gsap'
import { activeVehicles, emptyFilters, makes, paramsFromFilters } from '../lib/inventory'
import { bodyPlural } from '../lib/labels'
import { cityLocative } from '../lib/seo'
import type { Body } from '../types'

const BUDGETS = [15000, 20000, 25000, 30000, 40000]

function HeroSearch({ count }: { count: number }) {
  const navigate = useNavigate()
  const [marke, setMarke] = useState('')
  const [kainaIki, setKainaIki] = useState('')
  const matches = useMemo(
    () =>
      activeVehicles().filter((v) => (!marke || v.make === marke) && (!kainaIki || v.price <= Number(kainaIki))).length,
    [marke, kainaIki],
  )
  function submit(e: FormEvent) {
    e.preventDefault()
    const p = paramsFromFilters({ ...emptyFilters, marke, kainaIki: kainaIki ? Number(kainaIki) : null }, 'naujausi')
    navigate(`/automobiliai${p.size ? `?${p}` : ''}`)
  }
  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Greita automobilių paieška"
      className="grid gap-3 rounded-lg bg-white p-4 shadow-[0_24px_60px_-30px_rgb(14_15_17/0.35)] ring-1 ring-line sm:grid-cols-2 sm:p-5"
    >
      <div>
        <label htmlFor="hero-make" className="field-label">
          Markė
        </label>
        <select id="hero-make" className="field" value={marke} onChange={(e) => setMarke(e.target.value)}>
          <option value="">Visos markės</option>
          {makes().map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hero-budget" className="field-label">
          Kaina iki
        </label>
        <select id="hero-budget" className="field" value={kainaIki} onChange={(e) => setKainaIki(e.target.value)}>
          <option value="">Bet kokia</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {formatNumber(b)} €
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-accent sm:col-span-2">
        <Icon name="search" size={18} />
        Rodyti {marke || kainaIki ? carsCountAcc(matches) : `visus (${count})`}
      </button>
    </form>
  )
}

export default function Home() {
  const all = activeVehicles()
  const latest = all.slice(0, 6)
  const minPrice = Math.min(...all.map((v) => v.price))
  const scope = useRef<HTMLDivElement>(null)

  const bodies = (['universalas', 'visureigis', 'sedanas', 'hecbekas'] as Body[])
    .map((b) => ({ body: b, list: all.filter((v) => v.body === b) }))
    .filter((x) => x.list.length > 0)

  const electrified = all.filter((v) => ['hibridas', 'plug-in-hibridas', 'elektra'].includes(v.fuel)).length

  useGSAP(
    () => {
      // Pirmiausia nuimame CSS slėpimą, kad GSAP matytų galutines reikšmes
      markEntered()
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('[data-hero-word]', { yPercent: 110, duration: 0.9, stagger: 0.06 })
          .from('[data-hero-fade]', { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, '-=0.55')
          .from('[data-hero-photo]', { clipPath: 'inset(18% 6% 0% 6% round 8px)', duration: 1.2, ease: 'power4.out' }, 0.15)
          .from('[data-hero-photo] img', { scale: 1.12, duration: 1.6, ease: 'power3.out' }, 0.15)
          .from('[data-hero-search]', { autoAlpha: 0, y: 20, duration: 0.8 }, 0.45)

        // Jei naršyklė nepiešia kadrų (pvz. ekrano kopijų įrankiai), turinys vis tiek parodomas
        const safety = window.setTimeout(() => tl.progress(1), 3500)
        tl.eventCallback('onComplete', () => window.clearTimeout(safety))

        // Vienintelis su slinkimu susietas momentas: nuotrauka „išryškėja“ pirkimo žingsnių skiltyje
        gsap.fromTo(
          '[data-develop]',
          { clipPath: 'inset(12% 12% 12% 12% round 12px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 8px)',
            ease: 'none',
            scrollTrigger: { trigger: '[data-develop-section]', start: 'top 85%', end: 'top 15%', scrub: 0.6 },
          },
        )
        gsap.fromTo(
          '[data-develop] img',
          { scale: 1.18 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: '[data-develop-section]', start: 'top 85%', end: 'bottom 30%', scrub: 0.6 },
          },
        )
      })
    },
    { scope },
  )

  const h1Words = ['Naudoti', 'automobiliai', cityLocative(site.city)]

  return (
    <div ref={scope}>
      {/* HERO */}
      <section className="relative pt-8 pb-16 sm:pt-12 lg:pt-16 lg:pb-24" aria-labelledby="hero-title">
        <div className="wrap">
          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-10">
            <h1
              id="hero-title"
              data-enter
              className="font-display text-[clamp(2.75rem,8.4vw,7.25rem)] leading-[0.92] font-semibold tracking-[-0.035em] lg:col-span-8"
            >
              {h1Words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span data-hero-word className="inline-block">
                    {w}
                    {i < h1Words.length - 1 ? ' ' : ''}
                  </span>
                </span>
              ))}
            </h1>
            <div className="lg:col-span-4">
              <p data-hero-fade data-enter className="max-w-md text-[17px] leading-relaxed text-charcoal">
                Aikštelėje {addressLine.replace(`, ${site.city}`, '')} šiuo metu parduodami {carsCount(all.length)}, kainos nuo{' '}
                {formatPrice(minPrice)}. Kiekviename skelbime nurodyta rida, VIN, techninės apžiūros data ir žinomi defektai.
              </p>
              <div data-hero-search data-enter className="mt-6">
                <HeroSearch count={all.length} />
              </div>
            </div>
          </div>

          <div className="relative mt-10 lg:mt-12">
            <div data-hero-photo data-enter className="overflow-hidden rounded-lg bg-surface">
              <picture>
                <source media="(min-width: 768px)" srcSet="/media/hero-wide-1280.webp 1280w, /media/hero-wide-1920.webp 1920w" sizes="100vw" />
                <img
                  src="/media/hero-tall-900.webp"
                  srcSet="/media/hero-tall-600.webp 600w, /media/hero-tall-900.webp 900w"
                  sizes="100vw"
                  alt="Smėlio spalvos Volvo V60 Cross Country automobilių aikštelėje"
                  width={1920}
                  height={823}
                  fetchPriority="high"
                  className="aspect-[4/3] w-full object-cover md:aspect-[21/9]"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* NAUJAUSI */}
      <section className="py-16 lg:py-24" aria-labelledby="latest-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="latest-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
                Naujausi skelbimai
              </h2>
              <p className="mt-3 max-w-lg text-[16px] text-muted">Automobiliai, kuriuos į aikštelę atvežėme paskutiniai.</p>
            </div>
            <Link to="/automobiliai" className="btn btn-secondary">
              Žiūrėti visus automobilius
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
            {latest.map((v) => (
              <li key={v.slug} className="flex">
                <div className="w-full">
                  <VehicleCard vehicle={v} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PAGAL KĖBULĄ */}
      <section className="border-t border-line bg-surface py-16 lg:py-24" aria-labelledby="body-title">
        <div className="wrap">
          <h2 id="body-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
            Automobiliai pagal kėbulo tipą
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {bodies.map(({ body, list }) => (
              <li key={body}>
                <Link
                  to={`/automobiliai?kebulas=${body}`}
                  className="group relative block overflow-hidden rounded-lg bg-ink text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="zoom-frame aspect-[4/5] sm:aspect-[3/4]">
                    <VehicleImage base={list[0].photos[0]} alt="" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="opacity-85" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-16">
                    <p className="font-display text-[24px] font-semibold">{bodyPlural[body]}</p>
                    <p className="mt-0.5 flex items-center justify-between text-[14px] text-white/75">
                      {carsCount(list.length)}
                      <Icon name="arrowRight" size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {electrified > 0 && (
            <p className="mt-8 text-[15px] text-muted">
              Ieškote hibrido ar elektromobilio?{' '}
              <Link to="/automobiliai?kuras=hibridas,plug-in-hibridas,elektra" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Žiūrėti {carsCountAcc(electrified)} su elektros varikliu
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* KAIP PIRKTI – momentas */}
      <section data-develop-section className="py-16 lg:py-28" aria-labelledby="steps-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div data-develop className="zoom-frame overflow-hidden rounded-lg lg:sticky lg:top-28">
              <VehicleImage
                base="/inventory/peugeot-3008-2019/2"
                alt="Baltas Peugeot 3008 iš šono"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] lg:aspect-[4/5]"
              />
            </div>
          </div>
          <div className="lg:col-span-6 lg:py-6">
            <h2 id="steps-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
              Kaip vyksta pirkimas
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">
              Nuo skelbimo iki raktelių – keturi žingsniai. Jei automobilis rezervuotas, skelbime tai matysite iš karto.
            </p>
            <ol className="mt-10 border-t border-line">
              {[
                ['Išsirinkite automobilį', 'Skelbime rasite kainą, ridą, VIN, techninės apžiūros datą, komplektaciją ir žinomus defektus.'],
                ['Susisiekite su mumis', 'Paskambinkite arba parašykite užklausą. Patvirtinsime, kad automobilis vis dar parduodamas, ir atsakysime į klausimus.'],
                ['Apžiūrėkite ir išbandykite', 'Atvykite į aikštelę suderintu laiku. Automobilį galite išbandyti važiuodami, pageidaujant – nuvežti į pasirinktą servisą patikrai.'],
                ['Sutartis ir perregistravimas', 'Pasirašome pirkimo–pardavimo sutartį, perduodame dokumentus ir raktus. Automobilį perregistruojate Regitroje.'],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-line py-7">
                  <span className="font-display text-[15px] font-semibold text-accent tabular-nums">0{i + 1}</span>
                  <div>
                    <h3 className="text-[20px] font-semibold">{t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* SKELBIMO TURINYS */}
      <section className="bg-ink py-16 text-white lg:py-24" aria-labelledby="listing-title">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="listing-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
              Kas nurodyta kiekviename skelbime
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/65">
              Visus duomenis galite palyginti su automobilio dokumentais apžiūros metu.
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2 lg:col-span-7">
            {[
              ['Rida ir VIN', 'Odometro rodmuo ir kėbulo numeris. Pilną VIN atsiųsime, jei norėsite patikrinti istoriją.'],
              ['Techninė apžiūra', 'Mėnuo, iki kurio galioja techninė apžiūra.'],
              ['Defektai', 'Žinomi trūkumai įrašomi į skelbimą, net jei jie smulkūs.'],
              ['Komplektacija', 'Saugumo, salono ir multimedijos įranga, sugrupuota pagal paskirtį.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-ink p-6 lg:p-8">
                <dt className="font-display text-[20px] font-semibold">{t}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-white/65">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* APSILANKYMAS */}
      <section className="py-16 lg:py-28" aria-labelledby="visit-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">Aikštelė</p>
            <h2 id="visit-title" className="mt-3 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
              {site.street ?? site.city}
              {site.street && <span className="block text-muted">{site.city}</span>}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <dl className="space-y-2 text-[16px]">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6 border-b border-line pb-2">
                  <dt className="text-muted">{h.days}</dt>
                  <dd className="font-semibold">{h.hours}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/kontaktai#uzklausa" className="btn btn-primary">
                Siųsti užklausą
              </Link>
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Icon name="pin" size={18} />
                Rodyti žemėlapyje
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
