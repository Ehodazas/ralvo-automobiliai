import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { VehicleImage } from '../components/VehicleImage'
import { addressLine, site } from '../config/site'
import { cityLocative } from '../lib/seo'

/*
 * Šio puslapio tekstai aprašo pardavimo eigą. Prieš paleidžiant svetainę
 * peržiūrėkite juos su įmone ir palikite tik tai, kas atitinka tikrą praktiką.
 */
const principles = [
  {
    title: 'Skelbime – visa žinoma informacija',
    text: 'Rida, VIN, techninės apžiūros data, komplektacija ir žinomi defektai įrašomi į kiekvieną skelbimą. Jei ko nors trūksta, paklauskite – atsakysime raštu.',
  },
  {
    title: 'Apžiūra ir bandomasis važiavimas',
    text: 'Automobilį galite apžiūrėti aikštelėje ir išbandyti kelyje. Norėdami jį patikrinti pasirinktame servise, suderinkite laiką iš anksto.',
  },
  {
    title: 'Dokumentai kartu su automobiliu',
    text: 'Perduodame registracijos liudijimą, techninės apžiūros dokumentus, turimus serviso įrašus ir visus raktus.',
  },
  {
    title: 'Rezervacija skelbime',
    text: 'Kai automobilis rezervuojamas ar parduodamas, skelbimas pažymimas iš karto. Taip nevažiuosite apžiūrėti jau parduoto automobilio.',
  },
]

const beforeVisit = [
  'Susisiekite iš anksto, kad automobilis būtų paruoštas apžiūrai ir bandomajam važiavimui.',
  'Pasiimkite asmens tapatybės dokumentą – jo reikės sutarčiai ir bandomajam važiavimui.',
  'Prieš išvažiuodami nupirktu automobiliu apsidrauskite privalomuoju civilinės atsakomybės draudimu.',
  'Automobilį perregistruokite Regitroje – tai galima padaryti ir internetu per e. paslaugas.',
]

export default function About() {
  const hasCompany = site.legalName || site.companyCode
  return (
    <div>
      <section className="pt-10 pb-14 lg:pt-16 lg:pb-20" aria-labelledby="about-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 id="about-title" className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
              Naudotų automobilių pardavėjas {cityLocative(site.city)}
            </h1>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-charcoal lg:col-span-5 lg:pb-2">
            {site.name} parduoda naudotus lengvuosius automobilius iš savo aikštelės ({addressLine}). Svetainėje matote tuos pačius automobilius,
            kurie stovi aikštelėje, su kainomis ir pagrindiniais duomenimis.
          </p>
        </div>
      </section>

      <div className="wrap">
        <div className="zoom-frame overflow-hidden rounded-lg">
          <VehicleImage
            base="/inventory/bmw-530d-xdrive-touring-2018/2"
            alt="Juodas BMW 5 serijos universalas iš galo"
            sizes="100vw"
            className="aspect-[4/3] md:aspect-[21/9]"
          />
        </div>
      </div>

      <section className="py-16 lg:py-24" aria-labelledby="how-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-12">
          <h2 id="how-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold lg:col-span-4">
            Kaip parduodame automobilius
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:col-span-8">
            {principles.map((p, i) => (
              <li key={p.title} className="bg-white p-6 lg:p-8">
                <span className="font-display text-[14px] font-semibold text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-3 text-[20px] font-semibold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-surface py-16 lg:py-24" aria-labelledby="visit-title">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="visit-title" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
              Prieš atvykstant
            </h2>
            <p className="mt-4 text-[16px] text-muted">Keli dalykai, kurie sutaupys laiko perkant automobilį.</p>
          </div>
          <ol className="space-y-4 lg:col-span-8">
            {beforeVisit.map((t, i) => (
              <li key={t} className="flex gap-4 rounded-lg bg-white p-5 ring-1 ring-line">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-[16px] leading-relaxed">{t}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="contact-cta">
        <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="contact-cta" className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold">
              Automobiliai aikštelėje
            </h2>
            <p className="mt-3 max-w-lg text-[16px] text-muted">Peržiūrėkite skelbimus ir parašykite, kurį automobilį norėtumėte apžiūrėti.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/automobiliai" className="btn btn-primary">
              Žiūrėti visus automobilius
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link to="/kontaktai#uzklausa" className="btn btn-secondary">
              Siųsti užklausą
            </Link>
          </div>
        </div>

        {hasCompany && (
          <div className="wrap mt-16">
            <h2 className="text-[20px] font-semibold">Rekvizitai</h2>
            <dl className="mt-4 grid max-w-xl gap-2 text-[15px]">
              {site.legalName && (
                <div className="flex justify-between gap-6 border-b border-line pb-2">
                  <dt className="text-muted">Pavadinimas</dt>
                  <dd>{site.legalName}</dd>
                </div>
              )}
              {site.companyCode && (
                <div className="flex justify-between gap-6 border-b border-line pb-2">
                  <dt className="text-muted">Įmonės kodas</dt>
                  <dd>{site.companyCode}</dd>
                </div>
              )}
              {site.vatCode && (
                <div className="flex justify-between gap-6 border-b border-line pb-2">
                  <dt className="text-muted">PVM mokėtojo kodas</dt>
                  <dd>{site.vatCode}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}
