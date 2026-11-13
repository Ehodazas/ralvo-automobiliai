export type Fuel = 'benzinas' | 'dyzelinas' | 'hibridas' | 'plug-in-hibridas' | 'elektra'
export type Gearbox = 'automatine' | 'mechanine'
export type Body = 'sedanas' | 'universalas' | 'hecbekas' | 'visureigis'
export type Drive = 'priekiniai' | 'galiniai' | 'visi'
export type Status = 'available' | 'reserved' | 'sold'

export interface Vehicle {
  slug: string
  make: string
  model: string
  version: string
  year: number
  /** Pirmosios registracijos mėnuo, YYYY-MM */
  firstRegistration: string
  price: number
  mileage: number
  fuel: Fuel
  gearbox: Gearbox
  body: Body
  drive: Drive
  engineCc: number | null
  powerKw: number
  batteryKwh: number | null
  doors: number
  seats: number
  color: string
  /** Techninė apžiūra galioja iki, YYYY-MM */
  inspectionUntil: string | null
  /** Rodomas VIN (gali būti dalinai paslėptas) */
  vin: string
  euroStandard: string | null
  co2: number | null
  firstRegCountry: string
  defects: string
  features: { group: string; items: string[] }[]
  description: string[]
  /** Nuotraukų bazinis kelias be dydžio, pvz. /inventory/slug/1 */
  photos: string[]
  status: Status
  /** Įkėlimo data, YYYY-MM-DD */
  addedAt: string
  soldAt?: string | null
}
