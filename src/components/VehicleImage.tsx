import type { ImgHTMLAttributes } from 'react'
import { asset } from '../lib/base'

const WIDTHS = [640, 1080, 1600] as const

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Bazinis kelias be dydžio, pvz. /inventory/slug/1 */
  base: string
  alt: string
  sizes: string
  priority?: boolean
}

/** Optimizuotos WebP nuotraukos 3 dydžiais; naršyklė pasirenka tinkamiausią. */
export function VehicleImage({ base, alt, sizes, priority, className, ...rest }: Props) {
  return (
    <img
      src={asset(`${base}-1080.webp`)}
      srcSet={WIDTHS.map((w) => `${asset(base)}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={1600}
      height={1067}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`h-full w-full object-cover ${className ?? ''}`}
      {...rest}
    />
  )
}
