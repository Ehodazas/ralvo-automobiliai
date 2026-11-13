# Ralvo: used-car dealership website

A website for one Lithuanian used-car dealer, built with React 19, TypeScript, Vite 8 and Tailwind CSS 4. It is not a marketplace. All visible text is in Lithuanian.

> **This is a demo.** The company name "Ralvo", the contacts, the 12 cars, their prices and their VINs are all sample data. Every photo is a stand-in from Wikimedia Commons. A thin bar at the top of each page says this. See [Before launch](#before-launch).

## Pages

| URL | Page |
|---|---|
| `/` | Pradžia: hero with quick search, latest cars, body-type tiles, buying steps, visit block |
| `/automobiliai` | Inventory: text search, filters (brand, model, price, year, mileage, fuel, gearbox, body type, drive), sorting, filter chips, filter drawer on phones, filters stored in the URL |
| `/automobiliai/:slug` | Car page: gallery with lightbox and swipe, price, key facts, specs, equipment, description, enquiry form, call button, share button, similar cars, a sticky price bar on phones |
| `/apie-mus` | Apie mus |
| `/kontaktai` | Kontaktai with the enquiry form |
| `/privatumo-politika` | Privacy policy (GDPR) |
| `/nuotraukos` | Photo credits (required by the CC licences) |

## Why there is a small backend

A static frontend cannot send email or store anything. The enquiry form therefore posts to `POST /api/uzklausa`, handled in [server/enquiry.mjs](server/enquiry.mjs):

- It validates the input, has a hidden honeypot field and allows 5 requests per IP per 10 minutes (held in memory only).
- It sends the enquiry by **SMTP email** to `MAIL_TO`.
- If SMTP is not configured in production, it answers **503** and the form shows an error with the phone number. It never shows a fake "sent" message.
- Without SMTP, enquiries are written to `data/uzklausos.ndjson` instead, so the form can be tested. This happens automatically in `npm run dev`, and in production only when `ENQUIRY_FILE=true` is set.

The rest of the site is static HTML generated at build time.

## Run it locally

Requires Node.js 20.12 or newer (tested on Node 26).

```bash
npm install
```

```bash
npm run dev
```

Opens at http://localhost:5173. The enquiry form works here too: without SMTP, enquiries go to `data/uzklausos.ndjson`.

To test the production build:

```bash
npm run build
```

```bash
npm start
```

Opens at http://localhost:8787.

### What `npm run build` does

1. `npm run inventory -- check`: validates the car data and checks that every photo file exists.
2. `tsc -b`: type-check.
3. `vite build`: builds the client bundle.
4. `vite build --ssr`, then [scripts/prerender.mjs](scripts/prerender.mjs): renders **every page to static HTML** with its own `<title>`, description, canonical URL, Open Graph tags and JSON-LD (`AutoDealer`, and `Car` with `Offer` on each car page). It also writes `sitemap.xml`, `robots.txt` and `404.html`. Search engines get full content without running JavaScript, and React takes over in the browser.

## Managing the inventory

All cars are in one file, [src/data/vehicles.json](src/data/vehicles.json). There is no admin panel or database on purpose. For a dealer with 10 to 60 cars, a JSON file plus a CLI is the simplest setup that can't break. After any change, run `npm run build` and deploy.

```bash
npm run inventory -- list
```

```bash
npm run inventory -- sold volvo-xc60-d4-awd-2019
```

```bash
npm run inventory -- reserved volvo-xc60-d4-awd-2019
```

```bash
npm run inventory -- available volvo-xc60-d4-awd-2019
```

```bash
npm run inventory -- price volvo-xc60-d4-awd-2019 30900
```

```bash
npm run inventory -- check
```

What each status does on the site:

- **Sold** (`sold`): hidden from the list by default and shown only when "Rodyti ir parduotus" is ticked. The car page stays online with a "parduotas" banner, so old links and search results still work.
- **Reserved** (`reserved`): shown with a "Rezervuotas" badge and a note on the car page.

**Adding a car:**

1. Copy an existing entry in `vehicles.json` and change the fields. Allowed values for `fuel`, `gearbox`, `body` and `drive` are listed in [src/types.ts](src/types.ts).
2. Add photos. They are resized to WebP at 640, 1080 and 1600 px, cropped to 3:2, and assigned to the car:
   ```bash
   npm run inventory -- photos <slug> photo1.jpg photo2.jpg photo3.jpg
   ```
3. Run `npm run build`. The check step fails with a clear message if a field or a photo is missing.

If the dealer later needs non-technical staff to edit cars, `vehicles.json` can be swapped for a headless CMS (Sanity, Strapi, Directus) or a Google Sheet that is read at build time. Only [src/lib/inventory.ts](src/lib/inventory.ts) would need to change.

## Deployment

The output is a static `dist/` folder plus one dependency-free Node server ([server/index.mjs](server/index.mjs)). The server serves `dist/` with correct cache headers, gzip/brotli compression, security headers (CSP, nosniff, frame-deny), a 301 redirect for trailing slashes, real 404 responses, and the enquiry API.

**Option A: a VPS or any Node host (recommended).** This works on a Lithuanian VPS, Hetzner, Render, Railway or Fly.io.

```bash
npm ci && npm run build
```

```bash
cp .env.example .env
```

Fill in the SMTP values in `.env`, then start the server:

```bash
npm start
```

Keep it running with PM2 or systemd, and put Caddy or Nginx in front for HTTPS. Set `TRUST_PROXY=true` when running behind a proxy.

**GitHub Pages (demo hosting, already set up).** Every push to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which builds the site under the repository's sub-path and publishes it at `https://<owner>.github.io/<repo>/`. Pages serves static files only, so that build sets `VITE_ENQUIRY=off`: the form still validates input, but it says it isn't connected and sends nothing. To build for a sub-path yourself, set `BASE_PATH=/<repo>/` and `VITE_SITE_URL=https://<owner>.github.io/<repo>` before running `npm run build`.

**Option B: a static host (Netlify, Vercel, Cloudflare Pages).** Deploy `dist/`. The pages work, but `/api/uzklausa` must then be provided by that platform's serverless function. Wrap `handleEnquiry` from `server/enquiry.mjs` in the platform's function format, or the form will show its error state.

## Before launch

1. **Company data**: edit [src/config/site.ts](src/config/site.ts) (name, legal name, company code, VAT code, address, phone, email, hours, domain) and set `demo: false`. That removes the demo bar. Any field set to `null` is simply not shown.
2. **Cars and photos**: replace the demo inventory with real cars photographed by the dealer. Every current photo is a Wikimedia Commons stand-in: some show non-Lithuanian plates, a dealer badge, or an older or newer generation than the listing. When they are gone, update the `/nuotraukos` page and its footer link (or remove both). A good shot list per car: front three-quarter, rear three-quarter, side, dashboard, front seats, rear seats, boot, wheels, and any defect mentioned in the listing.
3. **Hero photo**: `public/media/hero-*.webp` and `public/og.jpg`. Ideally a photo of the dealer's own lot.
4. **Copy to confirm with the dealer**: the buying steps on the home page and the "Kaip parduodame automobilius" section on About. They describe a typical process (test drive, independent service check, documents handed over). Keep only what matches real practice.
5. **Privacy policy**: check the retention period (`RETENTION_MONTHS` in [src/pages/Privacy.tsx](src/pages/Privacy.tsx)) and the named processors (hosting, email).
6. **Logo**: replace [src/components/Logo.tsx](src/components/Logo.tsx) and `public/favicon.svg`.
7. **SMTP**: configure it and send a test enquiry from the live site.

## Research basis

Lithuanian car sites were checked on 2026-11-13 to align features and terminology:

- **Autoplius.lt**: listing and car pages read. Filters include make, model, year, price, engine size, power, mileage, fuel, body type, gearbox, drive, colour and defects. Car pages have a "Techninė informacija" block with labels such as *Pirma registracija, Kėbulo numeris (VIN), Tech. apžiūra iki, Euro standartas, CO₂ emisija, Pirmosios registracijos šalis*, plus "Komplektacija" and "Aprašymas" sections.
- **Longo.lt** (dealer): front page and a car page read. Filters cover make, series, model and body type. Car pages have spec, equipment-group and documents sections, call and test-drive actions, and privacy and terms pages in the footer.
- **Autogidas.lt**: refused automated access (HTTP 403), so nothing was taken from it.
- **Inchcape.lt**: a new-car dealer site, with no used-car inventory to compare.

The spec labels, the filter set and the equipment groups follow these sites. Marketplace features (seller ratings, chat, auctions), finance calculators and accounts were left out, as the brief asked.

## Project structure

```
src/
  config/site.ts        company data (the single source of truth)
  data/vehicles.json    inventory
  data/photo-credits.json
  lib/                  inventory and filters, SEO metadata, formatting, labels, GSAP setup
  components/           Header, Footer, VehicleCard, Gallery, FilterPanel, EnquiryForm, …
  pages/                one file per route
  entry-server.tsx      SSR entry used by the prerender step
server/                 production server and enquiry handler
scripts/                prerender + inventory CLI
public/inventory/       car photos (WebP, 3 sizes)
```

## Design and motion notes

- Palette: warm white `#fafaf8`, charcoal, black, and one copper accent `#b4532a`. Type: Inter Tight for headings and Manrope for body text, both self-hosted with Lithuanian glyphs. No Google Fonts requests are made, which keeps the privacy policy simple.
- Motion uses GSAP through `useGSAP`, scoped and cleaned up on unmount. There is one hero entrance on load and one scroll-linked moment (the photo in "Kaip vyksta pirkimas"). Hover gives small lifts and photo zooms. There are no fade-ins on every section. All motion is off under `prefers-reduced-motion`. If the browser does not draw frames, a timer finishes the entrance animation so content is never left hidden.
- Accessibility: skip link, visible focus rings, labelled fields with errors under each field, native `<dialog>` for the lightbox and the filter drawer, `aria-live` result count, and touch targets of at least 44 px.
- No cookies, analytics or third-party embeds are used, so no consent banner is needed. "Rodyti žemėlapyje" is a plain link to OpenStreetMap, not an iframe.
