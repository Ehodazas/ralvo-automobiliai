/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Viešas svetainės adresas (kanoninėms nuorodoms), pvz. https://user.github.io/repo */
  readonly VITE_SITE_URL?: string
  /** "off" – statinis talpinimas be serverio: užklausos forma nesiunčia duomenų */
  readonly VITE_ENQUIRY?: string
  /** "true" – kanoniniai adresai su galiniu „/“ (GitHub Pages) */
  readonly VITE_TRAILING_SLASH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
