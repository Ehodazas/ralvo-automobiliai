import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Icon } from './Icon'
import { VehicleImage } from './VehicleImage'

interface Props {
  photos: string[]
  alt: string
  dimmed?: boolean
}

function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<number | null>(null)
  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') start.current = e.clientX
    },
    onPointerUp: (e: PointerEvent) => {
      if (start.current === null) return
      const dx = e.clientX - start.current
      start.current = null
      if (Math.abs(dx) > 40) (dx < 0 ? onLeft : onRight)()
    },
  }
}

export function Gallery({ photos, alt, dimmed }: Props) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const openLightbox = () => {
    setLightbox(true)
    dialog.current?.showModal()
  }
  const n = photos.length
  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n])
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n])
  const swipe = useSwipe(next, prev)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const label = (i: number) => `${alt}, nuotrauka ${i + 1} iš ${n}`

  return (
    <div>
      <div className="group relative overflow-hidden rounded-lg bg-surface" {...swipe}>
        <button
          type="button"
          onClick={openLightbox}
          className="zoom-frame block aspect-[3/2] w-full cursor-zoom-in"
          aria-label={`Padidinti: ${label(index)}`}
        >
          <VehicleImage
            key={photos[index]}
            base={photos[index]}
            alt={label(index)}
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority={index === 0}
            className={dimmed ? 'grayscale-[60%]' : ''}
          />
        </button>
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white active:scale-95"
              aria-label="Ankstesnė nuotrauka"
            >
              <Icon name="arrowLeft" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white active:scale-95"
              aria-label="Kita nuotrauka"
            >
              <Icon name="arrowRight" />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute right-3 bottom-3 rounded bg-ink/75 px-2 py-1 text-[12px] font-semibold text-white tabular-nums">
          {index + 1} / {n}
        </span>
      </div>

      {n > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Nuotraukos">
          {photos.map((p, i) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Rodyti nuotrauką ${i + 1}`}
                aria-current={i === index}
                className={`zoom-frame block aspect-[3/2] w-full overflow-hidden rounded-md ring-offset-2 ring-offset-paper transition ${
                  i === index ? 'ring-2 ring-ink' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <VehicleImage base={p} alt="" sizes="160px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-white backdrop:bg-transparent"
        aria-label="Nuotraukų galerija"
        onClose={() => setLightbox(false)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-[14px] tabular-nums text-white/70">
              {index + 1} / {n}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Uždaryti galeriją"
              autoFocus
            >
              <Icon name="close" size={24} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-16" {...swipe}>
            {lightbox && (
              <img
                key={photos[index]}
                src={`${photos[index]}-1600.webp`}
                alt={label(index)}
                className="max-h-full max-w-full rounded object-contain"
              />
            )}
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 inline-flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:left-4"
                  aria-label="Ankstesnė nuotrauka"
                >
                  <Icon name="arrowLeft" size={24} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 inline-flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:right-4"
                  aria-label="Kita nuotrauka"
                >
                  <Icon name="arrowRight" size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
    </div>
  )
}
