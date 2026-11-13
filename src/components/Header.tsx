import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { activeVehicles } from '../lib/inventory'
import { carsCount } from '../lib/format'
import { cart, favorites } from '../lib/store'
import { Icon, type IconName } from './Icon'
import { Logo } from './Logo'
import { openSearch } from './Search'

export const navItems = [
  { to: '/automobiliai', label: 'Automobiliai' },
  { to: '/apie-mus', label: 'Apie mus' },
  { to: '/kontaktai', label: 'Kontaktai' },
]

/** Faktai apie svetainės funkcijas – be pažadų, kurių įmonė nepatvirtino */
function benefits(): { icon: IconName; text: string }[] {
  return [
    { icon: 'key', text: `Aikštelėje ${carsCount(activeVehicles().length)}` },
    { icon: 'calendar', text: 'Rezervuokite automobilį internetu' },
    { icon: 'shield', text: 'Kiekviename skelbime – VIN, rida ir defektai' },
    { icon: 'heart', text: 'Žymėkite patinkančius automobilius' },
  ]
}

function BenefitStrip() {
  const items = benefits()
  return (
    <div className="overflow-hidden border-b border-white/10 bg-charcoal text-[13px] text-white/75">
      {site.demo && (
        <p className="border-b border-white/10 bg-accent/90 py-1.5 text-center text-[12px] font-semibold text-white">
          Demonstracinė versija: automobiliai, kainos ir kontaktai yra pavyzdiniai.
        </p>
      )}
      <div className="marquee group flex py-2" aria-label="Privalumai">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className={`marquee-track flex shrink-0 items-center gap-12 pr-12 lg:w-full lg:justify-around lg:gap-6 lg:pr-0 ${copy === 1 ? 'lg:hidden' : ''}`}
          >
            {items.map((b) => (
              <li key={b.text} className="flex items-center gap-2 whitespace-nowrap">
                <Icon name={b.icon} size={15} className="text-[#f0a37f]" />
                {b.text}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function CountIcon({ to, icon, count, label, target }: { to: string; icon: IconName; count: number; label: string; target: 'cart' | 'fav' }) {
  return (
    <NavLink
      to={to}
      aria-label={`${label}${count ? ` (${count})` : ''}`}
      title={label}
      className={({ isActive }) =>
        `relative inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:size-11 ${isActive ? 'bg-white/10' : ''}`
      }
    >
      <span data-target={target} className="inline-flex">
        <Icon name={icon} size={21} fill={icon === 'heart' && count ? 'currentColor' : 'none'} className={icon === 'heart' && count ? 'text-[#f0a37f]' : ''} />
      </span>
      {count > 0 && (
        <span className="absolute top-1 right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </NavLink>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuTop, setMenuTop] = useState(68)
  const headerRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const favCount = favorites.useList().length
  const cartCount = cart.useList().length

  // Uždaryti meniu pakeitus puslapį
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <BenefitStrip />
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 bg-ink text-white transition-shadow duration-300 ${scrolled ? 'shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]' : ''}`}
      >
        <div className={`wrap flex items-center justify-between gap-4 transition-[height] duration-300 ${scrolled ? 'h-[60px]' : 'h-[68px] lg:h-[76px]'}`}>
          <Link to="/" className="-m-2 flex min-h-11 items-center p-2" aria-label={`${site.name} – pradžia`}>
            <Logo inverted />
          </Link>

          <nav aria-label="Pagrindinis meniu" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      `relative inline-flex min-h-11 items-center px-3.5 text-[15px] font-semibold transition-colors ${
                        isActive ? 'text-white' : 'text-white/65 hover:text-white'
                      } after:absolute after:inset-x-3.5 after:bottom-2 after:h-0.5 after:origin-left after:rounded after:bg-accent after:transition-transform after:duration-300 ${
                        isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              onClick={() => openSearch()}
              className="hidden min-h-11 items-center gap-2.5 rounded-full border border-white/15 pr-2 pl-4 text-[14px] text-white/70 transition hover:border-white/40 hover:text-white lg:inline-flex"
            >
              <Icon name="search" size={17} />
              Ieškoti automobilio
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/60">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={() => openSearch()}
              className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10 sm:size-11 lg:hidden"
              aria-label="Ieškoti automobilio"
            >
              <Icon name="search" size={21} />
            </button>
            <CountIcon to="/patinka" icon="heart" count={favCount} label="Patinkantys automobiliai" target="fav" />
            <CountIcon to="/krepselis" icon="cart" count={cartCount} label="Krepšelis" target="cart" />
            <Link to="/kontaktai#uzklausa" className="btn btn-accent ml-2 hidden min-h-11 xl:inline-flex">
              Siųsti užklausą
            </Link>
            <button
              type="button"
              className="-mr-2 inline-flex size-10 items-center justify-center rounded-md sm:size-11 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Uždaryti meniu' : 'Atidaryti meniu'}
              onClick={() => {
                setMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 68)
                setOpen((o) => !o)
              }}
            >
              <Icon name={open ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>

        <div id="mobile-menu" hidden={!open} style={{ top: menuTop }} className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-ink text-white md:hidden">
          <nav aria-label="Mobilusis meniu" className="wrap flex min-h-full flex-col pt-6 pb-8">
            <ul className="border-t border-white/10">
              {[{ to: '/', label: 'Pradžia' }, ...navItems, { to: '/patinka', label: `Patinka (${favCount})` }, { to: '/krepselis', label: `Krepšelis (${cartCount})` }].map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      `flex min-h-16 items-center justify-between border-b border-white/10 font-display text-[26px] font-semibold ${isActive ? 'text-[#f0a37f]' : ''}`
                    }
                  >
                    {n.label}
                    <Icon name="arrowRight" size={22} className="text-white/40" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-3 pt-10">
              {site.phone && site.phoneHref && (
                <a href={`tel:${site.phoneHref}`} className="btn btn-ghost-light w-full">
                  <Icon name="phone" size={18} /> Skambinti {site.phone}
                </a>
              )}
              <Link to="/kontaktai#uzklausa" className="btn btn-accent w-full">
                Siųsti užklausą
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
