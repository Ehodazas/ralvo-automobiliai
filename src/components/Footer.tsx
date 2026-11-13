import { Link } from 'react-router-dom'
import { addressLine, mapHref, site } from '../config/site'
import { cityLocative } from '../lib/seo'
import { navItems } from './Header'
import { Logo } from './Logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-ink text-white/70">
      <div className="wrap grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link to="/" className="inline-flex min-h-11 items-center" aria-label={`${site.name} – pradžia`}>
            <Logo inverted />
          </Link>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
            Naudotų automobilių pardavimas {cityLocative(site.city)}. Skelbimuose esančius automobilius galima apžiūrėti aikštelėje
            darbo metu.
          </p>
        </div>

        <nav aria-label="Puslapiai" className="lg:col-span-2">
          <h2 className="text-[13px] font-semibold text-white">Puslapiai</h2>
          <ul className="mt-4 space-y-1">
            <li>
              <Link to="/" className="inline-flex min-h-11 items-center text-[15px] hover:text-white">
                <span className="link-draw">Pradžia</span>
              </Link>
            </li>
            {navItems.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="inline-flex min-h-11 items-center text-[15px] hover:text-white">
                  <span className="link-draw">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-[13px] font-semibold text-white">Aikštelė</h2>
          <address className="mt-4 space-y-1 text-[15px] not-italic">
            <a href={mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-white">
              <span className="link-draw">{addressLine}</span>
            </a>
            {site.phone && site.phoneHref && (
              <a href={`tel:${site.phoneHref}`} className="flex min-h-11 items-center hover:text-white">
                <span className="link-draw">{site.phone}</span>
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`} className="flex min-h-11 items-center hover:text-white">
                <span className="link-draw">{site.email}</span>
              </a>
            )}
          </address>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-[13px] font-semibold text-white">Darbo laikas</h2>
          <dl className="mt-4 space-y-2 text-[15px]">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-6 border-b border-white/10 pb-2">
                <dt>{h.days}</dt>
                <dd className="text-white">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[13px] md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName ?? site.name}
            {site.companyCode && <>, įm. k. {site.companyCode}</>}
            {site.vatCode && <>, PVM k. {site.vatCode}</>}
          </p>
          <ul className="flex flex-wrap gap-x-6">
            <li>
              <Link to="/privatumo-politika" className="inline-flex min-h-11 items-center hover:text-white">
                <span className="link-draw">Privatumo politika</span>
              </Link>
            </li>
            <li>
              <Link to="/nuotraukos" className="inline-flex min-h-11 items-center hover:text-white">
                <span className="link-draw">Nuotraukos: Wikimedia Commons</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
