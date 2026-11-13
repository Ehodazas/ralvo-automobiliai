import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

/** Pažymi, kad įėjimo animacija įvyko (index.html atsarginis laikmatis nebeslėps turinio). */
export function markEntered() {
  if (typeof window === 'undefined') return
  ;(window as unknown as { __entered?: boolean }).__entered = true
  document.documentElement.classList.remove('js-enter')
}

export { gsap, ScrollTrigger, useGSAP }
