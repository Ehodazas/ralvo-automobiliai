import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, metaFor } from '../lib/seo'

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (content === null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * Atnaujina <head> naršant tarp puslapių. Pirmą kartą užkraunant tie patys
 * duomenys jau būna įrašyti į statinį HTML (žr. scripts/prerender.ts).
 */
export function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    setMeta('name', 'description', m.description)
    setMeta('name', 'robots', m.noindex ? 'noindex' : null)
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.description)
    setMeta('property', 'og:url', absoluteUrl(m.path))
    setMeta('property', 'og:image', absoluteUrl(m.image ?? '/og.jpg'))
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = absoluteUrl(m.path)
    document.head.querySelectorAll('script[data-ld]').forEach((s) => s.remove())
    for (const ld of m.jsonLd ?? []) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.dataset.ld = ''
      s.textContent = JSON.stringify(ld)
      document.head.appendChild(s)
    }
  }, [pathname])
  return null
}
