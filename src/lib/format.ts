const priceFmt = new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 })

/** 17900 → „17 900 €“ (lietuviškas tūkstančių skirtukas – tarpas) */
export const formatPrice = (n: number) => `${priceFmt.format(n).replace(/\s/g, ' ')} €`

export const formatNumber = (n: number) => priceFmt.format(n).replace(/\s/g, ' ')

export const formatKm = (n: number) => `${formatNumber(n)} km`

export const formatPower = (kw: number) => `${kw} kW (${Math.round(kw * 1.35962)} AG)`

export const formatEngine = (cc: number | null) =>
  cc ? `${(cc / 1000).toFixed(1).replace('.', ',')} l (${formatNumber(cc)} cm³)` : null

/** „2019-04“ → „2019-04“; paliekame ISO formą, kurią Lietuvoje įprasta naudoti skelbimuose */
export const formatMonth = (ym: string | null) => ym ?? '—'

/** Lietuviška daugiskaita: 1 automobilis, 2 automobiliai, 10 automobilių */
export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return few
  return many
}

export const carsCount = (n: number) =>
  `${n} ${plural(n, 'automobilis', 'automobiliai', 'automobilių')}`

/** Galininkas: „Rodyti 3 automobilius“ */
export const carsCountAcc = (n: number) =>
  `${n} ${plural(n, 'automobilį', 'automobilius', 'automobilių')}`
