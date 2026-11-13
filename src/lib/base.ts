/**
 * Svetainė gali veikti ne domeno šaknyje (pvz. GitHub Pages: /ralvo-automobiliai/).
 * Kelias nustatomas build metu per BASE_PATH (žr. vite.config.ts).
 */
export const BASE_URL = import.meta.env.BASE_URL // visada baigiasi „/“

/** React Router basename be galinio brūkšnio; šaknyje – undefined */
export const ROUTER_BASENAME = BASE_URL === '/' ? undefined : BASE_URL.replace(/\/$/, '')

/** Viešo failo kelias su baziniu keliu: asset('/inventory/x/1-640.webp') */
export const asset = (p: string) => BASE_URL + p.replace(/^\//, '')
