import type { Status } from '../types'
import { statusLabels } from '../lib/labels'

export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  if (status === 'available') return null
  const style =
    status === 'sold' ? 'bg-ink text-white' : 'bg-white text-accent-dark ring-1 ring-accent/40'
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[12px] font-bold tracking-wide ${style} ${className}`}>
      {statusLabels[status]}
    </span>
  )
}
