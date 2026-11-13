import { addressLine, site } from '../config/site'
import type { Vehicle } from '../types'
import { carsCount, formatKm, formatPrice } from './format'
import { fuelLabels, gearboxLabels } from './labels'
import { activeVehicles, getVehicle, vehicleFullTitle, vehiclePath } from './inventory'

export interface PageMeta {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  jsonLd?: object[]
}

const abs = (p: string) => `${site.url.replace(/\/$/, '')}${p}`

const dealerLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: site.legalName ?? site.name,
  url: site.url,
  ...(site.phone ? { telephone: site.phone } : {}),
  ...(site.email ? { email: site.email } : {}),
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.city,
    addressCountry: 'LT',
    ...(site.street ? { streetAddress: site.street } : {}),
    ...(site.postalCode ? { postalCode: site.postalCode } : {}),
  },
})

const vehicleLd = (v: Vehicle) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: vehicleFullTitle(v),
  brand: { '@type': 'Brand', name: v.make },
  model: v.model,
  vehicleModelDate: String(v.year),
  mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.mileage, unitCode: 'KMT' },
  fuelType: fuelLabels[v.fuel],
  vehicleTransmission: gearboxLabels[v.gearbox],
  color: v.color,
  image: v.photos.map((p) => abs(`${p}-1600.webp`)),
  url: abs(vehiclePath(v)),
  itemCondition: 'https://schema.org/UsedCondition',
  offers: {
    '@type': 'Offer',
    price: v.price,
    priceCurrency: 'EUR',
    availability: v.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    seller: { '@type': 'AutoDealer', name: site.name },
  },
})

/** Vienintelis metaduomenų šaltinis: naudoja ir naršyklė, ir statinio generavimo skriptas. */
export function metaFor(pathname: string): PageMeta {
  const city = site.city
  const count = activeVehicles().length
  if (pathname === '/') {
    return {
      title: `Naudoti automobiliai ${cityLocative(city)} | ${site.name}`,
      description: `${site.name} – naudotų automobilių pardavėjas ${cityLocative(city)}. Parduodami automobiliai: ${carsCount(count)}. Kainos, rida, VIN ir nuotraukos kiekviename skelbime.`,
      path: '/',
      jsonLd: [dealerLd()],
    }
  }
  if (pathname === '/automobiliai') {
    return {
      title: `Parduodami automobiliai | ${site.name}`,
      description: `Visi ${site.name} parduodami naudoti automobiliai ${cityLocative(city)}. Filtruokite pagal markę, modelį, kainą, metus, ridą, kurą ir pavarų dėžę.`,
      path: '/automobiliai',
    }
  }
  const m = pathname.match(/^\/automobiliai\/([^/]+)$/)
  if (m) {
    const v = getVehicle(m[1])
    if (v) {
      const sold = v.status === 'sold'
      return {
        title: `${vehicleFullTitle(v)}${sold ? ' – parduotas' : ''} | ${site.name}`,
        description: `${vehicleFullTitle(v)}: ${formatPrice(v.price)}, ${formatKm(v.mileage)}, ${fuelLabels[v.fuel].toLowerCase()}, ${gearboxLabels[v.gearbox].toLowerCase()} pavarų dėžė. Apžiūrėkite ${cityLocative(city)}.`.replace(/ /g, ' '),
        path: vehiclePath(v),
        image: `${v.photos[0]}-1080.webp`,
        jsonLd: [vehicleLd(v)],
      }
    }
  }
  if (pathname === '/apie-mus') {
    return {
      title: `Apie mus | ${site.name}`,
      description: `Kaip ${site.name} parduoda naudotus automobilius ${cityLocative(city)}: ką rasite skelbime, kaip vyksta apžiūra ir pirkimas.`,
      path: '/apie-mus',
    }
  }
  if (pathname === '/kontaktai') {
    return {
      title: `Kontaktai | ${site.name}`,
      description: `${site.name} kontaktai: ${addressLine}. Darbo laikas, telefonas ir užklausos forma.`,
      path: '/kontaktai',
      jsonLd: [dealerLd()],
    }
  }
  if (pathname === '/privatumo-politika') {
    return {
      title: `Privatumo politika | ${site.name}`,
      description: `Kaip ${site.name} tvarko asmens duomenis, gautus per užklausos formą, ir kokius slapukus naudoja svetainė.`,
      path: '/privatumo-politika',
    }
  }
  return {
    title: `Puslapis nerastas | ${site.name}`,
    description: 'Tokio puslapio nėra.',
    path: pathname,
    noindex: true,
  }
}

/** Miesto vietininkas antraštėms: Kaunas → Kaune. Jei miestas nežinomas – „Lietuvoje“. */
export function cityLocative(city: string) {
  const map: Record<string, string> = {
    Vilnius: 'Vilniuje',
    Kaunas: 'Kaune',
    Klaipėda: 'Klaipėdoje',
    Šiauliai: 'Šiauliuose',
    Panevėžys: 'Panevėžyje',
    Alytus: 'Alytuje',
    Marijampolė: 'Marijampolėje',
    Utena: 'Utenoje',
  }
  return map[city] ?? 'Lietuvoje'
}

export const absoluteUrl = abs
