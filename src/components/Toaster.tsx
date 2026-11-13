import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { dismissToast, useToasts, type Toast } from '../lib/store'
import { Icon } from './Icon'

function ToastItem({ t }: { t: Toast }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from(ref.current, { y: 24, opacity: 0, scale: 0.96, duration: 0.45, ease: 'back.out(1.6)' })
  }, [])
  return (
    <div
      ref={ref}
      className="pointer-events-auto flex items-center gap-4 rounded-lg bg-ink py-3 pr-2 pl-4 text-[14px] text-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]"
    >
      <span className="flex-1">{t.text}</span>
      {t.action && (
        <Link to={t.action.to} onClick={() => dismissToast(t.id)} className="min-h-9 rounded px-2 py-2 font-semibold text-[#f0a37f] hover:text-white">
          {t.action.label}
        </Link>
      )}
      <button type="button" onClick={() => dismissToast(t.id)} className="inline-flex size-9 items-center justify-center rounded text-white/60 hover:text-white" aria-label="Uždaryti pranešimą">
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToasts()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-20 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end lg:bottom-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  )
}
