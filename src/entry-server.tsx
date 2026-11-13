import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { ROUTER_BASENAME } from './lib/base'
import { vehicles, vehiclePath } from './lib/inventory'

export { metaFor } from './lib/seo'
export { site } from './config/site'

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter basename={ROUTER_BASENAME} location={(ROUTER_BASENAME ?? '') + url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  )
}

/** Visi puslapiai, kuriuos reikia sugeneruoti statiškai. */
export const routes = [
  '/',
  '/automobiliai',
  '/apie-mus',
  '/kontaktai',
  '/privatumo-politika',
  '/nuotraukos',
  '/patinka',
  '/krepselis',
  ...vehicles.map(vehiclePath),
]

export const sitemapEntries = () =>
  routes
    .filter((r) => !['/nuotraukos', '/patinka', '/krepselis'].includes(r))
    .map((r) => {
      const v = vehicles.find((x) => vehiclePath(x) === r)
      return { path: r, lastmod: v ? (v.soldAt ?? v.addedAt) : undefined }
    })
