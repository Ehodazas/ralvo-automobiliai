import { useSyncExternalStore } from 'react'

/**
 * Patinkantys automobiliai ir krepšelis saugomi tik šioje naršyklėje (localStorage).
 * Nėra paskyrų ir serverio duomenų bazės – sąrašai nesiunčiami, kol lankytojas
 * pats nepateikia rezervacijos užklausos.
 */

type Listener = () => void
const EMPTY: readonly string[] = Object.freeze([])

function createListStore(key: string, max: number) {
  let cache: readonly string[] | null = null
  const listeners = new Set<Listener>()

  const read = (): readonly string[] => {
    if (cache) return cache
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? '[]')
      cache = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, max) : EMPTY
    } catch {
      cache = EMPTY
    }
    return cache
  }

  const write = (next: readonly string[]) => {
    cache = next
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      /* privatus režimas – sąrašas galioja iki puslapio uždarymo */
    }
    listeners.forEach((l) => l())
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== key) return
      cache = null
      listeners.forEach((l) => l())
    })
  }

  const subscribe = (l: Listener) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }

  return {
    max,
    get: read,
    has: (slug: string) => read().includes(slug),
    add: (slug: string) => {
      const list = read()
      if (list.includes(slug)) return 'exists' as const
      if (list.length >= max) return 'full' as const
      write([...list, slug])
      return 'added' as const
    },
    remove: (slug: string) => write(read().filter((s) => s !== slug)),
    toggle(slug: string) {
      if (read().includes(slug)) {
        this.remove(slug)
        return false
      }
      return this.add(slug) === 'added'
    },
    clear: () => write(EMPTY),
    useList: () => useSyncExternalStore(subscribe, read, () => EMPTY),
  }
}

export const favorites = createListStore('ralvo:patinka', 50)
/** Vienu metu rezervuoti galima iki 3 automobilių */
export const cart = createListStore('ralvo:krepselis', 3)

// ---- Pranešimai (toast) ----

export interface Toast {
  id: number
  text: string
  action?: { label: string; to: string }
}

let toasts: Toast[] = []
const toastListeners = new Set<Listener>()
let nextId = 1

export function toast(text: string, action?: Toast['action']) {
  const t = { id: nextId++, text, action }
  toasts = [...toasts.slice(-2), t]
  toastListeners.forEach((l) => l())
  setTimeout(() => dismissToast(t.id), 4200)
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  toastListeners.forEach((l) => l())
}

const NO_TOASTS: Toast[] = []
export const useToasts = () =>
  useSyncExternalStore(
    (l) => {
      toastListeners.add(l)
      return () => toastListeners.delete(l)
    },
    () => toasts,
    () => NO_TOASTS,
  )
