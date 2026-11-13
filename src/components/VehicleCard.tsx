import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import { formatKm, formatPrice } from '../lib/format'
import { fuelLabels, gearboxLabels } from '../lib/labels'
import { vehiclePath, vehicleTitle } from '../lib/inventory'
import { AddToCartButton, FavoriteButton } from './Actions'
import { Icon } from './Icon'
import { StatusBadge } from './StatusBadge'
import { VehicleImage } from './VehicleImage'

interface Props {
  vehicle: Vehicle
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function VehicleCard({ vehicle: v, priority, headingLevel: H = 'h3' }: Props) {
  const sold = v.status === 'sold'
  const drop = v.previousPrice && v.previousPrice > v.price ? v.previousPrice - v.price : 0
  const chips = [String(v.year), formatKm(v.mileage), fuelLabels[v.fuel], gearboxLabels[v.gearbox]]

  return (
    <article
      data-card
      data-fly-root
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[transform,box-shadow,border-color] duration-500 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-30px_rgb(14_15_17/0.45)]"
    >
      <div className="zoom-frame relative aspect-[3/2] bg-surface">
        <VehicleImage
          base={v.photos[0]}
          alt={`${v.make} ${v.model}, ${v.year} m.`}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
          priority={priority}
          className={sold ? 'grayscale-[60%]' : ''}
        />
        {v.photos[1] && (
          <VehicleImage
            base={v.photos[1]}
            alt=""
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
            className="card-photo-alt absolute inset-0"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/45 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <StatusBadge status={v.status} />
          {drop > 0 && !sold && (
            <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-1 text-[12px] font-bold text-white">
              <Icon name="trendDown" size={14} />
              −{formatPrice(drop)}
            </span>
          )}
        </div>
        <FavoriteButton vehicle={v} className="absolute top-3 right-3" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded bg-ink/70 px-2 py-1 text-[12px] font-semibold text-white backdrop-blur">
          <Icon name="camera" size={14} />
          {v.photos.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <H className="text-[19px] leading-snug font-semibold">
          <Link to={vehiclePath(v)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {vehicleTitle(v)}
          </Link>
        </H>
        <p className="mt-0.5 truncate text-[14px] text-muted">{v.version}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Pagrindiniai duomenys">
          {chips.map((c) => (
            <li key={c} className="rounded bg-surface px-2 py-1 text-[12.5px] font-medium text-charcoal">
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-2">
            <p className={`font-display text-[26px] leading-none font-semibold tracking-tight ${sold ? 'text-muted line-through decoration-1' : ''}`}>
              <span className="sr-only">Kaina: </span>
              {formatPrice(v.price)}
            </p>
            {drop > 0 && !sold && (
              <p className="text-[14px] text-muted line-through">
                <span className="sr-only">Ankstesnė kaina: </span>
                {formatPrice(v.previousPrice!)}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
            <AddToCartButton vehicle={v} />
            <span
              aria-hidden="true"
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink text-[14px] font-semibold text-white transition-colors group-hover:bg-accent"
            >
              {sold ? 'Žiūrėti skelbimą' : 'Žiūrėti automobilį'}
              <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
