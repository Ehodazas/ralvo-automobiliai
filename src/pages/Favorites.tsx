import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { VehicleCard } from '../components/VehicleCard'
import { carsCount } from '../lib/format'
import { getVehicle } from '../lib/inventory'
import { favorites } from '../lib/store'
import type { Vehicle } from '../types'

export default function Favorites() {
  const slugs = favorites.useList()
  const list = slugs.map(getVehicle).filter((v): v is Vehicle => !!v)

  return (
    <div className="pt-10 pb-20 lg:pt-14">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
          <div>
            <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">Patinkantys automobiliai</h1>
            <p className="mt-3 text-[16px] text-muted">
              {list.length ? `Pažymėta: ${carsCount(list.length)}. ` : ''}Sąrašas saugomas tik šioje naršyklėje.
            </p>
          </div>
          {list.length > 0 && (
            <button type="button" onClick={() => favorites.clear()} className="btn btn-secondary">
              <Icon name="trash" size={18} />
              Išvalyti sąrašą
            </button>
          )}
        </div>

        {list.length ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <li key={v.slug}>
                <VehicleCard vehicle={v} headingLevel="h2" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong px-6 py-20 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon name="heart" size={26} />
            </span>
            <h2 className="mt-5 text-[24px] font-semibold">Dar nieko nepažymėjote</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
              Paspauskite širdelę ant automobilio nuotraukos – jis atsiras čia, kad vėliau lengvai rastumėte.
            </p>
            <Link to="/automobiliai" className="btn btn-primary mt-7">
              Žiūrėti visus automobilius
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
