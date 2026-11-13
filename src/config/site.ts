/**
 * Įmonės duomenys. Viskas, kas rodoma svetainėje apie įmonę, imama tik iš čia.
 *
 * SVARBU: dabartinės reikšmės yra demonstracinės. Prieš paleidžiant svetainę
 * pakeiskite jas tikrais įmonės duomenimis ir nustatykite `demo: false`.
 * Laukas su `null` svetainėje tiesiog nerodomas.
 */
export interface OpeningHours {
  days: string
  hours: string
}

export interface SiteConfig {
  demo: boolean
  name: string
  legalName: string | null
  companyCode: string | null
  vatCode: string | null
  url: string
  city: string
  /** Gatvė ir numeris, pvz. „Savanorių pr. 000“. */
  street: string | null
  postalCode: string | null
  phone: string | null
  /** Telefonas be tarpų tel: nuorodai, pvz. +37060000000 */
  phoneHref: string | null
  email: string | null
  hours: OpeningHours[]
  socials: { label: string; href: string }[]
}

export const site: SiteConfig = {
  demo: true,
  name: 'Ralvo',
  legalName: null,
  companyCode: null,
  vatCode: null,
  /** Pagrindinis adresas be galinio brūkšnio; build metu gali būti pakeistas per VITE_SITE_URL */
  url: import.meta.env.VITE_SITE_URL || 'https://www.ralvo.lt',
  city: 'Kaunas',
  street: 'Savanorių pr.',
  postalCode: null,
  phone: '+370 600 00000',
  phoneHref: '+37060000000',
  email: 'info@ralvo.example',
  hours: [
    { days: 'I–V', hours: '9.00–18.00' },
    { days: 'VI', hours: '10.00–15.00' },
    { days: 'VII', hours: 'Nedirbame' },
  ],
  socials: [],
}

export const addressLine = [site.street, site.city].filter(Boolean).join(', ')

export const mapHref = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
  [site.street, site.city, 'Lietuva'].filter(Boolean).join(' '),
)}`
