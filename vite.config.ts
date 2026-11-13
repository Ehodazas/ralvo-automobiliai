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
    },
  }
}

export default defineConfig({
  // Pvz. BASE_PATH=/ralvo-automobiliai/ GitHub Pages projekto svetainei
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), enquiryApi()],
  build: {
    target: 'es2022',
  },
})
