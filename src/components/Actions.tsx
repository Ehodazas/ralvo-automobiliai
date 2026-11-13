import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { cart, favorites, toast } from '../lib/store'
import type { Vehicle } from '../types'
import { vehicleTitle } from '../lib/inventory'
import { Icon } from './Icon'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Mažas „kibirkščių“ žiedas aplink širdelę */
function burst(el: HTMLElement) {
  if (reduced()) return
  const r = el.getBoundingClientRect()
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('span')
    dot.style.cssText = `position:fixed;left:${r.left + r.width / 2 - 3}px;top:${r.top + r.height / 2 - 3}px;width:6px;height:6px;border-radius:9px;background:var(--color-accent);pointer-events:none;z-index:80`
    document.body.appendChild(dot)
    const a = (i / 8) * Math.PI * 2
    gsap.to(dot, {
      x: Math.cos(a) * 26,
      y: Math.sin(a) * 26,
      scale: 0,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => dot.remove(),
    })
  }
}

/** Pulsuojantis ženkliukas antraštėje (krepšelis / patinka) */
export function bumpTarget(name: 'cart' | 'fav') {
  const el = document.querySelector<HTMLElement>(`[data-target="${name}"]`)
  if (!el || reduced()) return
  gsap.fromTo(el, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
}

/** Nuotraukos kopija „nuskrenda“ į krepšelio ikoną antraštėje */
function flyToCart(from: HTMLElement | null) {
  const target = document.querySelector<HTMLElement>('[data-target="cart"]')
  const img = from?.closest('[data-fly-root]')?.querySelector('img')
  if (!target || !img || reduced()) return bumpTarget('cart')
  const a = img.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const clone = img.cloneNode() as HTMLImageElement
  clone.removeAttribute('loading')
  clone.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;object-fit:cover;border-radius:10px;z-index:90;pointer-events:none;box-shadow:0 20px 40px -10px rgb(0 0 0/.4)`
  document.body.appendChild(clone)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  gsap
    .timeline({ onComplete: () => (clone.remove(), bumpTarget('cart')) })
    .to(clone, { scale: 0.85, duration: 0.15, ease: 'power1.out' })
    .to(clone, { x: dx, duration: 0.75, ease: 'power2.inOut' }, '>')
    .to(clone, { y: dy, duration: 0.75, ease: 'back.in(1.6)' }, '<')
    .to(clone, { scale: 0.06, opacity: 0.4, borderRadius: '50%', duration: 0.75, ease: 'power3.in' }, '<')
}

export function FavoriteButton({ vehicle, className = '', size = 'md' }: { vehicle: Vehicle; className?: string; size?: 'md' | 'lg' }) {
  const list = favorites.useList()
  const active = list.includes(vehicle.slug)
  const ref = useRef<HTMLButtonElement>(null)
  const dim = size === 'lg' ? 'size-12' : 'size-10'

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const now = favorites.toggle(vehicle.slug)
    const heart = ref.current?.querySelector('svg')
    if (heart && !reduced()) gsap.fromTo(heart, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' })
    if (now) {
      burst(ref.current!)
      bumpTarget('fav')
      toast(`${vehicleTitle(vehicle)} pridėtas prie patinkančių`, { label: 'Peržiūrėti', to: '/patinka' })
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Pašalinti ${vehicleTitle(vehicle)} iš patinkančių` : `Pažymėti ${vehicleTitle(vehicle)} kaip patinkantį`}
      title={active ? 'Patinka' : 'Pažymėti, kad patinka'}
      className={`${className.includes('absolute') ? '' : 'relative'} z-10 inline-flex ${dim} items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white ${
        active ? 'text-accent' : 'text-charcoal hover:text-accent'
      } ${className}`}
    >
      <Icon name="heart" size={size === 'lg' ? 22 : 19} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}

export function AddToCartButton({
  vehicle,
  variant = 'icon',
  goToCart = false,
  compact = false,
  className = '',
}: {
  vehicle: Vehicle
  variant?: 'icon' | 'full'
  goToCart?: boolean
  /** Trumpas užrašas siauroms vietoms (telefono juosta) */
  compact?: boolean
  className?: string
}) {
  const list = cart.useList()
  const inCart = list.includes(vehicle.slug)
  const navigate = useNavigate()
  const ref = useRef<HTMLButtonElement>(null)
  const unavailable = vehicle.status !== 'available'

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) {
      if (goToCart || variant === 'full') navigate('/krepselis')
      else {
        cart.remove(vehicle.slug)
        toast(`${vehicleTitle(vehicle)} išimtas iš krepšelio`)
      }
      return
    }
    const r = cart.add(vehicle.slug)
    if (r === 'full') {
      toast(`Vienu metu galima rezervuoti iki ${cart.max} automobilių`, { label: 'Atidaryti krepšelį', to: '/krepselis' })
      return
    }
    flyToCart(ref.current)
    if (goToCart) {
      setTimeout(() => navigate('/krepselis'), reduced() ? 0 : 650)
    } else {
      toast(`${vehicleTitle(vehicle)} įdėtas į krepšelį`, { label: 'Rezervuoti', to: '/krepselis' })
    }
  }

  if (unavailable) {
    return variant === 'full' ? (
      <button type="button" disabled className={`btn btn-secondary w-full cursor-not-allowed opacity-60 ${className}`}>
        {vehicle.status === 'sold' ? 'Parduotas' : 'Jau rezervuotas'}
      </button>
    ) : null
  }

  if (variant === 'full') {
    return (
      <button ref={ref} type="button" onClick={onClick} className={`btn ${goToCart ? 'btn-accent' : 'btn-secondary'} w-full ${className}`}>
        <Icon name={inCart ? 'check' : goToCart ? 'calendar' : 'cart'} size={18} />
        {compact
          ? 'Rezervuoti'
          : goToCart
            ? inCart
              ? 'Tęsti rezervaciją'
              : 'Rezervuoti automobilį'
            : inCart
              ? 'Krepšelyje – atidaryti'
              : 'Įdėti į krepšelį'}
      </button>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={inCart}
      aria-label={inCart ? `Išimti ${vehicleTitle(vehicle)} iš krepšelio` : `Įdėti ${vehicleTitle(vehicle)} į krepšelį`}
      title={inCart ? 'Krepšelyje' : 'Į krepšelį'}
      className={`relative z-10 inline-flex size-11 items-center justify-center rounded-md transition-colors ${
        inCart ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink hover:border-ink'
      } ${className}`}
    >
      <Icon name={inCart ? 'check' : 'cart'} size={19} />
    </button>
  )
}
