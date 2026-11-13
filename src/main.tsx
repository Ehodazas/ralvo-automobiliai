import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { ROUTER_BASENAME } from './lib/base'
import './index.css'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
)

// Iš anksto sugeneruotas HTML „atgaivinamas“. Jei URL turi filtrų parametrų,
// turinys skiriasi nuo sugeneruoto, todėl atvaizduojame iš naujo.
if (container.hasChildNodes() && !window.location.search) {
  hydrateRoot(container, app)
} else {
  container.textContent = ''
  createRoot(container).render(app)
}
