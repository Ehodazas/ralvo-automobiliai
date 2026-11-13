import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import About from './pages/About'
import Cart from './pages/Cart'
import Contact from './pages/Contact'
import Credits from './pages/Credits'
import Favorites from './pages/Favorites'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import VehicleDetail from './pages/VehicleDetail'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="automobiliai" element={<Inventory />} />
        <Route path="automobiliai/:slug" element={<VehicleDetail />} />
        <Route path="apie-mus" element={<About />} />
        <Route path="kontaktai" element={<Contact />} />
        <Route path="privatumo-politika" element={<Privacy />} />
        <Route path="nuotraukos" element={<Credits />} />
        <Route path="patinka" element={<Favorites />} />
        <Route path="krepselis" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
