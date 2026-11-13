import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/** Kūrimo metu užklausos forma veikia per tą patį Vite serverį. */
function enquiryApi(): Plugin {
  return {
    name: 'enquiry-api',
    apply: 'serve',
    configureServer(server) {
      try {
        process.loadEnvFile('.env')
      } catch {
        /* .env nebūtinas */
      }
      server.middlewares.use('/api/uzklausa', async (req, res) => {
        const { handleEnquiry } = await import('./server/enquiry.mjs')
        await handleEnquiry(req, res, { dev: true })
      })
      server.middlewares.use('/api/rezervacija', async (req, res) => {
        const { handleReservation } = await import('./server/enquiry.mjs')
        await handleReservation(req, res, { dev: true })
      })
    },
  }
}

export default defineConfig({
  // Pvz. BASE_PATH=/ralvo-automobiliai/ GitHub Pages projekto svetainei
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), enquiryApi()],
  build: {
    target: 'es2022',
    // Bibliotekos atskiruose failuose: po svetainės atnaujinimo naršyklė jų nesisiunčia iš naujo
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'gsap', test: /node_modules[\\/](gsap|@gsap)[\\/]/ },
          ],
        },
      },
    },
  },
})
