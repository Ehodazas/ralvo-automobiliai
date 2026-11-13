import type { Body, Drive, Fuel, Gearbox, Status } from '../types'

export const fuelLabels: Record<Fuel, string> = {
  benzinas: 'Benzinas',
  dyzelinas: 'Dyzelinas',
  hibridas: 'Hibridas',
  'plug-in-hibridas': 'Įkraunamas hibridas',
  elektra: 'Elektra',
}

export const gearboxLabels: Record<Gearbox, string> = {
  automatine: 'Automatinė',
  mechanine: 'Mechaninė',
}

export const bodyLabels: Record<Body, string> = {
  sedanas: 'Sedanas',
  universalas: 'Universalas',
  hecbekas: 'Hečbekas',
  visureigis: 'Visureigis / krosoveris',
}

export const bodyPlural: Record<Body, string> = {
  sedanas: 'Sedanai',
  universalas: 'Universalai',
  hecbekas: 'Hečbekai',
  visureigis: 'Visureigiai',
}

export const driveLabels: Record<Drive, string> = {
  priekiniai: 'Priekiniai',
  galiniai: 'Galiniai',
  visi: 'Visi (4x4)',
}

export const statusLabels: Record<Status, string> = {
  available: 'Parduodamas',
  reserved: 'Rezervuotas',
  sold: 'Parduotas',
}
