import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { usePageMotion } from './Motion'
import { SearchOverlay } from './Search'
import { Seo } from './Seo'
import { Toaster } from './Toaster'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      if (!hash) return
    }
    if (hash) {
      // Palaukiame, kol puslapis atsivaizduos
      requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView())
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export function Layout() {
  const main = useRef<HTMLElement>(null)
  usePageMotion(main)
  return (
    <>
      <a
        href="#turinys"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-md bg-ink px-4 py-3 text-[15px] font-semibold text-white focus:translate-y-0"
      >
        Pereiti prie turinio
      </a>
      <Seo />
      <ScrollManager />
      <Header />
      <main ref={main} id="turinys" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
      <Toaster />
    </>
  )
}
