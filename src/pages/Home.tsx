import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Counter, SplitWords } from '../components/Motion'
import { quickSearches, ResultRow, useSearch } from '../components/Search'
import { VehicleCard } from '../components/VehicleCard'
import { VehicleImage } from '../components/VehicleImage'
import { mapHref, site } from '../config/site'
import { asset } from '../lib/base'
import { carsCount, carsCountAcc, formatPrice } from '../lib/format'
import { gsap, markEntered, useGSAP } from '../lib/gsap'
import { activeVehicles, makes, vehiclePath } from '../lib/inventory'
import { bodyPlural } from '../lib/labels'
import { cityLocative } from '../lib/seo'
import type { Body } from '../types'

/** Didelis paieškos laukas su gyvais rezultatais (Arnold Clark stiliumi) */
function HeroSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { results, total, empty } = useSearch(q, 5)
  const box = useRef<HTMLFormElement>(null)
  const listId = useId()
  const show = open && q.trim().length > 0

  useEffect(() => {
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (show && active >= 0 && results[active]) return navigate(vehiclePath(results[active]))
    navigate(q.trim() ? `/automobiliai?q=${encodeURIComponent(q.trim())}` : '/automobiliai')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <form ref={box} onSubmit={submit} role="search" aria-label="Automobilių paieška" className="relative">
      <div className="search-glow flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_30px_70px_-25px_rgb(0_0_0/0.7)]">
        <Icon name="search" size={22} className="shrink-0 text-muted" />
        <label htmlFor="hero-q" className="sr-only">
          Ieškoti automobilio
        </label>
        <input
          id="hero-q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          autoComplete="off"
          placeholder="Pvz. Volvo, universalas, 2020"
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted/70"
        />
        <button type="submit" className="btn btn-accent btn-shine min-h-12 rounded-full px-6">
          Ieškoti
        </button>
      </div>
      {show && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl bg-white p-2 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.55)]">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Paieškos rezultatai">
              {results.map((v, i) => (
                <ResultRow key={v.slug} v={v} id={`${listId}-${i}`} active={i === active} />
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-[14px] text-muted">Pagal „{q}“ automobilių nerasta.</p>
          )}
          {!empty && total > results.length && (
            <button type="submit" className="mt-1 flex min-h-11 w-full items-center justify-center rounded-md text-[14px] font-semibold hover:bg-surface">
              Rodyti visus {total}
            </button>
          )}
        </div>
      )}
    </form>
  )
}

/** Horizontali karuselė su rodyklėmis, slenkama ir pirštu */
function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null)
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('li')
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 20), behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div className="absolute -top-20 right-0 hidden gap-2 sm:flex">
        <button type="button" onClick={() => scrollBy(-1)} className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-white transition hover:border-ink active:scale-95" aria-label="Ankstesni">
          <Icon name="arrowLeft" size={18} />
        </button>
        <button type="button" onClick={() => scrollBy(1)} className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-white transition hover:border-ink active:scale-95" aria-label="Kiti">
          <Icon name="arrowRight" size={18} />
        </button>
      </div>
      <ul
        ref={track}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  )
}

export default function Home() {
  const all = activeVehicles()
  const latest = all.slice(0, 6)
  const drops = all.filter((v) => v.previousPrice && v.previousPrice > v.price)
  const minPrice = Math.min(...all.map((v) => v.price))
  const brandList = makes()
  const scope = useRef<HTMLDivElement>(null)

  const bodies = (['universalas', 'visureigis', 'sedanas', 'hecbekas'] as Body[])
    .map((b) => ({ body: b, list: all.filter((v) => v.body === b) }))
    .filter((x) => x.list.length > 0)
  const electrified = all.filter((v) => ['hibridas', 'plug-in-hibridas', 'elektra'].includes(v.fuel)).length

  useGSAP(
    () => {
      markEntered()
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('[data-hero-bg]', { scale: 1.18, duration: 2.4, ease: 'power2.out' }, 0)
          .from('[data-hero-word]', { yPercent: 115, duration: 1, stagger: 0.07 }, 0.2)
          .from('[data-hero-fade]', { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.1 }, 0.55)
          .from('[data-hero-chip]', { autoAlpha: 0, y: 12, scale: 0.9, duration: 0.5, stagger: 0.05 }, 0.9)
          .from('[data-hero-tile]', { autoAlpha: 0, y: 40, duration: 0.8, stagger: 0.08 }, 1.0)

        const safety = window.setTimeout(() => tl.progress(1), 3500)
        tl.eventCallback('onComplete', () => window.clearTimeout(safety))

        // Lėtas fono slinkimas
        gsap.to('[data-hero-bg]', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
        })

        // Pirkimo žingsniai: nuotrauka „išryškėja“, numeriai ir linija pildosi slenkant
        gsap.fromTo(
          '[data-develop]',
          { clipPath: 'inset(14% 14% 14% 14% round 16px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 12px)',
            ease: 'none',
            scrollTrigger: { trigger: '[data-develop-section]', start: 'top 85%', end: 'top 15%', scrub: 0.6 },
          },
        )
        gsap.fromTo('[data-develop] img', { scale: 1.2 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-develop-section]', start: 'top 85%', end: 'bottom 30%', scrub: 0.6 },
        })
        gsap.fromTo('[data-step-line]', { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-steps]', start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
        })
        gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
          gsap.from(el, { opacity: 0.25, x: 24, duration: 0.6, scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' } })
        })
      })
    },
    { scope },
  )

  const h1Words = ['Naudoti', 'automobiliai', cityLocative(site.city)]

  return (
    <div ref={scope}>
      {/* HERO – tamsus, kinematografiškas */}
      <section data-hero className="relative isolate overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
        <div className="absolute inset-0 -z-10">
          <picture>
            <source media="(min-width: 768px)" srcSet={`${asset('/media/hero-wide-1280.webp')} 1280w, ${asset('/media/hero-wide-1920.webp')} 1920w`} sizes="100vw" />
            <img
              data-hero-bg
              src={asset('/media/hero-tall-900.webp')}
              srcSet={`${asset('/media/hero-tall-600.webp')} 600w, ${asset('/media/hero-tall-900.webp')} 900w`}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              className="h-full w-full object-cover object-[65%_center] opacity-70"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(14_15_17/0.94)_0%,rgb(14_15_17/0.75)_45%,rgb(14_15_17/0.25)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="wrap flex min-h-[calc(100svh-120px)] flex-col justify-center pt-14 pb-10 lg:min-h-[760px] lg:pt-20">
          <div className="max-w-3xl">
            <p data-hero-fade data-enter className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-white/80 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#f0a37f] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#f0a37f]" />
              </span>
              Aikštelėje {carsCount(all.length)}, kainos nuo {formatPrice(minPrice)}
            </p>
            <h1 id="hero-title" data-enter className="mt-6 font-display text-[clamp(2.9rem,8vw,6.75rem)] leading-[0.92] font-semibold tracking-[-0.035em]">
              {h1Words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span data-hero-word className="inline-block">
                    {w}
                    {i < h1Words.length - 1 ? ' ' : ''}
                  </span>
                </span>
              ))}
            </h1>
            <p data-hero-fade data-enter className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75">
              Kiekviename skelbime – rida, VIN, techninės apžiūros data ir žinomi defektai. Patikusį automobilį rezervuokite internetu ir atvykite
              apžiūrėti į aikštelę {cityLocative(site.city)}.
            </p>
            <div data-hero-fade data-enter className="relative z-30 mt-8 max-w-2xl">
              <HeroSearch />
            </div>
            <ul className="mt-5 flex max-w-2xl flex-wrap gap-2" aria-label="Greita paieška">
              {quickSearches.map((s) => (
                <li key={s.to} data-hero-chip data-enter>
                  <Link to={s.to} className="inline-flex min-h-9 items-center rounded-full border border-white/15 bg-white/5 px-3.5 text-[13px] font-semibold text-white/85 backdrop-blur transition hover:border-white hover:bg-white hover:text-ink">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <ul className="mt-14 grid grid-cols-2 gap-3 lg:mt-20 lg:grid-cols-4" aria-label="Automobiliai pagal kėbulo tipą">
            {bodies.map(({ body, list }) => (
              <li key={body} data-hero-tile data-enter>
                <Link
                  to={`/automobiliai?kebulas=${body}`}
                  className="group flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2.5 pr-4 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.12]"
                >
                  <span className="zoom-frame block aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-lg sm:w-20">
                    <VehicleImage base={list[0].photos[0]} alt="" sizes="80px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[16px] font-semibold sm:text-[18px]">{bodyPlural[body]}</span>
                    <span className="block text-[13px] text-white/60">{carsCount(list.length)}</span>
                  </span>
                  <Icon name="arrowRight" size={18} className="hidden text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SKAIČIAI */}
      <section className="border-b border-line bg-white" aria-label="Aikštelė skaičiais">
        <dl className="wrap grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {[
            { k: 'Automobilių aikštelėje', v: <Counter value={all.length} /> },
            { k: 'Skirtingų markių', v: <Counter value={brandList.length} /> },
            { k: 'Pigiausias automobilis', v: <Counter value={minPrice} suffix={' €'} /> },
            { k: 'Hibridai ir elektromobiliai', v: <Counter value={electrified} /> },
          ].map((s) => (
            <div key={s.k} data-reveal className="px-2 py-8 lg:px-8 lg:py-10">
              <dd className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-none font-semibold tracking-tight">{s.v}</dd>
              <dt className="mt-2 text-[14px] text-muted">{s.k}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* KAINOS SUMAŽINTOS */}
      {drops.length > 0 && (
        <section className="overflow-hidden py-16 lg:py-24" aria-labelledby="drops-title">
          <div className="wrap">
            <div className="max-w-xl pr-28">
              <p data-reveal className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-dark">
                <Icon name="trendDown" size={16} /> Kainos sumažintos
              </p>
              <SplitWords id="drops-title" text="Pigiau nei buvo" className="mt-2 text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold" />
            </div>
            <div className="mt-10">
              <Carousel label="Automobiliai su sumažinta kaina">
                {drops.map((v) => (
                  <li key={v.slug} className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-40px)/3)]">
                    <VehicleCard vehicle={v} />
                  </li>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* MARKĖS – begalinė juosta */}
      <section className="border-y border-line bg-surface py-8" aria-label="Markės aikštelėje">
        <div className="marquee marquee-slow flex overflow-hidden">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="marquee-track flex shrink-0 items-center gap-14 pr-14">
              {[...brandList, ...brandList].map((m, i) => (
                <li key={`${m}-${i}`}>
                  <Link
                    to={`/automobiliai?marke=${encodeURIComponent(m)}`}
                    tabIndex={copy === 1 || i >= brandList.length ? -1 : undefined}
                    className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-tight whitespace-nowrap text-ink/25 transition-colors hover:text-ink"
                  >
                    {m}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* NAUJAUSI */}
      <section className="py-16 lg:py-24" aria-labelledby="latest-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SplitWords id="latest-title" text="Naujausi skelbimai" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold" />
              <p data-reveal className="mt-3 max-w-lg text-[16px] text-muted">
                Automobiliai, kuriuos į aikštelę atvežėme paskutiniai.
              </p>
            </div>
            <Link to="/automobiliai" data-reveal className="btn btn-secondary">
              Žiūrėti visus automobilius
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
            {latest.map((v) => (
              <li key={v.slug}>
                <VehicleCard vehicle={v} />
              </li>
            ))}
          </ul>
          {electrified > 0 && (
            <p data-reveal className="mt-10 text-center text-[15px] text-muted">
              Ieškote hibrido ar elektromobilio?{' '}
              <Link to="/automobiliai?kuras=hibridas,plug-in-hibridas,elektra" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Žiūrėti {carsCountAcc(electrified)} su elektros varikliu
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* KAIP PIRKTI IR REZERVUOTI */}
      <section data-develop-section className="bg-surface py-16 lg:py-28" aria-labelledby="steps-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div data-develop className="zoom-frame overflow-hidden rounded-xl lg:sticky lg:top-28">
              <VehicleImage base="/inventory/peugeot-3008-2019/2" alt="Baltas Peugeot 3008 iš šono" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] lg:aspect-[4/5]" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:py-6">
            <SplitWords id="steps-title" text="Kaip rezervuoti ir pirkti" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold" />
            <p data-reveal className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">
              Nuo skelbimo iki raktelių – keturi žingsniai. Rezervuoti ir apžiūrėti galite iki trijų automobilių vienu metu.
            </p>
            <ol data-steps className="relative mt-10">
              <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.1rem] w-px bg-line-strong" />
              <span aria-hidden="true" data-step-line className="absolute top-2 bottom-2 left-[1.1rem] w-px origin-top bg-accent" />
              {[
                ['Išsirinkite ir pažymėkite', 'Patikusius automobilius pažymėkite širdele, o tuos, kuriuos norite apžiūrėti, įdėkite į krepšelį.'],
                ['Pateikite rezervaciją', 'Krepšelyje nurodykite kontaktus ir patogų apžiūros laiką. Nieko mokėti nereikia.'],
                ['Patvirtiname telefonu', `Darbo laiku paskambinsime ir patvirtinsime rezervaciją. Patvirtintas automobilis skelbime pažymimas kaip rezervuotas.`],
                ['Apžiūra, sutartis, raktai', 'Atvykite, išbandykite automobilį, pasirašykite sutartį. Automobilį perregistruojate Regitroje.'],
              ].map(([t, d], i) => (
                <li key={t} data-step className="relative grid grid-cols-[2.25rem_1fr] gap-5 pb-9 last:pb-0">
                  <span className="relative z-10 inline-flex size-9 items-center justify-center rounded-full bg-ink font-display text-[14px] font-semibold text-white tabular-nums ring-4 ring-surface">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[20px] font-semibold">{t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/automobiliai" data-reveal className="btn btn-primary btn-shine mt-10">
              Rinktis automobilį
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SKELBIMO TURINYS */}
      <section className="bg-ink py-16 text-white lg:py-24" aria-labelledby="listing-title">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SplitWords id="listing-title" text="Kas nurodyta kiekviename skelbime" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold" />
            <p data-reveal className="mt-4 max-w-md text-[16px] leading-relaxed text-white/65">
              Visus duomenis galite palyginti su automobilio dokumentais apžiūros metu.
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:col-span-7">
            {[
              ['Rida ir VIN', 'Odometro rodmuo ir kėbulo numeris. Pilną VIN atsiųsime, jei norėsite patikrinti istoriją.'],
              ['Techninė apžiūra', 'Mėnuo, iki kurio galioja techninė apžiūra.'],
              ['Defektai', 'Žinomi trūkumai įrašomi į skelbimą, net jei jie smulkūs.'],
              ['Komplektacija', 'Saugumo, salono ir multimedijos įranga, sugrupuota pagal paskirtį.'],
            ].map(([t, d]) => (
              <div key={t} data-reveal className="group bg-ink p-6 transition-colors duration-500 hover:bg-charcoal lg:p-8">
                <dt className="font-display text-[20px] font-semibold">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent transition-transform duration-500 group-hover:scale-150" />
                  {t}
                </dt>
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
            <p data-reveal className="eyebrow">Aikštelė</p>
            <SplitWords
              id="visit-title"
              text={`${site.street ?? site.city}${site.street ? ` ${site.city}` : ''}`}
              className="mt-3 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.03em]"
            />
          </div>
          <div data-reveal className="lg:col-span-5">
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
