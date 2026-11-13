import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { Icon } from './Icon'
import { Logo } from './Logo'

export const navItems = [
  { to: '/automobiliai', label: 'Automobiliai' },
  { to: '/apie-mus', label: 'Apie mus' },
  { to: '/kontaktai', label: 'Kontaktai' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
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
      {site.demo && (
        <div className="bg-charcoal text-[13px] text-white/80">
          <p className="wrap py-2 text-center">
            Demonstracinė versija: automobiliai, kainos ir kontaktai yra pavyzdiniai.
          </p>
        </div>
      )}
      <header
        className={`sticky top-0 z-40 border-b bg-paper/90 backdrop-blur-md transition-colors duration-300 ${
          scrolled || open ? 'border-line' : 'border-transparent'
        }`}
      >
        <div className="wrap flex h-[68px] items-center justify-between gap-6 lg:h-[76px]">
          <Link to="/" className="-m-2 flex min-h-11 items-center p-2" aria-label={`${site.name} – pradžia`}>
            <Logo />
          </Link>

          <nav aria-label="Pagrindinis meniu" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      `relative inline-flex min-h-11 items-center px-3.5 text-[15px] font-semibold transition-colors ${
                        isActive ? 'text-ink' : 'text-muted hover:text-ink'
                      } after:absolute after:inset-x-3.5 after:bottom-2 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 ${
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

          <div className="hidden items-center gap-5 md:flex">
            {site.phone && site.phoneHref && (
              <a href={`tel:${site.phoneHref}`} className="hidden min-h-11 items-center gap-2 text-[15px] font-semibold lg:inline-flex">
                <Icon name="phone" size={18} className="text-accent" />
                <span className="link-draw">{site.phone}</span>
              </a>
            )}
            <Link to="/kontaktai#uzklausa" className="btn btn-primary min-h-11">
              Siųsti užklausą
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-md md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Uždaryti meniu' : 'Atidaryti meniu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        <div
          id="mobile-menu"
          hidden={!open}
          className="fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-paper md:hidden"
        >
          <nav aria-label="Mobilusis meniu" className="wrap flex min-h-full flex-col pt-6 pb-8">
            <ul className="border-t border-line">
              <li>
                <NavLink to="/" end className="flex min-h-16 items-center justify-between border-b border-line font-display text-[26px] font-semibold">
                  Pradžia
                </NavLink>
              </li>
              {navItems.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      `flex min-h-16 items-center justify-between border-b border-line font-display text-[26px] font-semibold ${isActive ? 'text-accent' : ''}`
                    }
                  >
                    {n.label}
                    <Icon name="arrowRight" size={22} className="text-muted" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-3 pt-10">
              {site.phone && site.phoneHref && (
                <a href={`tel:${site.phoneHref}`} className="btn btn-secondary w-full">
                  <Icon name="phone" size={18} /> Skambinti {site.phone}
                </a>
              )}
              <Link to="/kontaktai#uzklausa" className="btn btn-primary w-full">
                Siųsti užklausą
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
