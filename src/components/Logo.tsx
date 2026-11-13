import { site } from '../config/site'

/** Žodinis ženklas. Turint įmonės logotipą, pakeiskite šį komponentą <img> arba SVG. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${inverted ? 'text-white' : 'text-ink'}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="5" fill="currentColor" />
        <path d="M7 19V7h6.2a3.8 3.8 0 0 1 0 7.6H7m6.6 0L19 19" fill="none" stroke={inverted ? '#0e0f11' : '#fafaf8'} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="19.3" cy="7.2" r="1.7" fill="var(--color-accent)" />
      </svg>
      <span className="font-display text-[19px] font-bold tracking-[0.14em] uppercase">{site.name}</span>
    </span>
  )
}
