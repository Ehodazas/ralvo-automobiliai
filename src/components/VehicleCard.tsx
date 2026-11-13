import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import { formatKm, formatPrice } from '../lib/format'
import { fuelLabels, gearboxLabels } from '../lib/labels'
import { vehiclePath, vehicleTitle } from '../lib/inventory'
import { StatusBadge } from './StatusBadge'
import { VehicleImage } from './VehicleImage'

interface Props {
  vehicle: Vehicle
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function VehicleCard({ vehicle: v, priority, headingLevel: H = 'h3' }: Props) {
  const sold = v.status === 'sold'
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-[transform,box-shadow,border-color] duration-300 ease-(--ease-out-soft) hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgb(14_15_17/0.35)]">
      <div className="zoom-frame relative aspect-[3/2] bg-surface">
        <VehicleImage
          base={v.photos[0]}
          alt={`${v.make} ${v.model}, ${v.year} m.`}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
          priority={priority}
          className={sold ? 'grayscale-[60%]' : ''}
        />
        <StatusBadge status={v.status} className="absolute top-3 left-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <H className="text-[19px] leading-snug font-semibold">
          <Link to={vehiclePath(v)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {vehicleTitle(v)}
          </Link>
        </H>
        <p className="mt-0.5 truncate text-[14px] text-muted">{v.version}</p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-charcoal" aria-label="Pagrindiniai duomenys">
          <li>{v.year}</li>
          <li aria-hidden="true" className="text-line-strong">/</li>
          <li>{formatKm(v.mileage)}</li>
          <li aria-hidden="true" className="text-line-strong">/</li>
          <li>{fuelLabels[v.fuel]}</li>
          <li aria-hidden="true" className="text-line-strong">/</li>
          <li>{gearboxLabels[v.gearbox]}</li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <p className={`font-display text-[24px] font-semibold tracking-tight ${sold ? 'text-muted line-through decoration-1' : ''}`}>
            <span className="sr-only">Kaina: </span>
            {formatPrice(v.price)}
          </p>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-muted transition-colors group-hover:text-ink" aria-hidden="true">
            Žiūrėti
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform duration-300 group-hover:translate-x-0.5">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  )
}
