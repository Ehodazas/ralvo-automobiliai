import { useRef, type ElementType, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { formatNumber } from '../lib/format'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/**
 * Antraštė, kurios žodžiai išnyra po vieną, kai ji pasirodo ekrane.
 * Žodžius sukuria pats React, todėl DOM nekeičiamas už jo ribų.
 */
export function SplitWords({ text, as: Tag = 'h2', className, id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={className} data-words aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <span className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}

/** Skaičius, kuris „suskaičiuojamas“ nuo nulio pasirodžius ekrane */
export function Counter({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      const obj = { n: 0 }
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => (el.textContent = formatNumber(Math.round(obj.n)) + suffix),
        onStart: () => (el.textContent = '0' + suffix),
      })
    })
  }, [value])
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {formatNumber(value)}
      {suffix}
    </span>
  )
}

/**
 * Bendros slinkimo animacijos visam puslapiui:
 *  - [data-reveal] blokai iškyla,
 *  - [data-card] kortelės iškyla grupėmis,
 *  - [data-words] antraščių žodžiai išnyra,
 *  - [data-parallax] nuotraukos lėtai slenka.
 * Animuojami tik elementai žemiau pirmojo ekrano, kad nebūtų mirgėjimo.
 */
export function usePageMotion(scope: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation()
  const first = useRef(true)

  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Puslapio perėjimas (ne pirmo užkrovimo metu)
        if (!first.current) {
          gsap.fromTo(root, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' })
        }
        first.current = false

        const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92

        const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root).filter(below)
        gsap.set(reveal, { opacity: 0, y: 36 })
        ScrollTrigger.batch(reveal, {
          start: 'top 90%',
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }),
        })

        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root).filter(below)
        gsap.set(cards, { opacity: 0, y: 48, scale: 0.97 })
        ScrollTrigger.batch(cards, {
          start: 'top 92%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' }),
        })

        gsap.utils.toArray<HTMLElement>('[data-words]', root).forEach((h) => {
          if (!below(h)) return
          gsap.from(h.querySelectorAll(':scope > span > span'), {
            yPercent: 110,
            duration: 0.85,
            ease: 'power4.out',
            stagger: 0.05,
            scrollTrigger: { trigger: h, start: 'top 88%', once: true },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -8 },
            { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        })

        // Saugiklis: jei naršyklė nepiešia kadrų (ekrano kopijų įrankiai), turinys vis tiek parodomas
        const f0 = gsap.ticker.frame
        const t = window.setTimeout(() => {
          if (gsap.ticker.frame - f0 < 5) gsap.set([...reveal, ...cards], { opacity: 1, y: 0, scale: 1 })
        }, 1500)
        return () => window.clearTimeout(t)
      })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  )
}
