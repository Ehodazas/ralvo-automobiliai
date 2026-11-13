import { EnquiryForm } from '../components/EnquiryForm'
import { Icon } from '../components/Icon'
import { addressLine, mapHref, site } from '../config/site'
import { cityLocative } from '../lib/seo'

export default function Contact() {
  return (
    <div className="pb-20">
      <section className="pt-10 pb-12 lg:pt-16 lg:pb-16" aria-labelledby="contact-title">
        <div className="wrap">
          <h1 id="contact-title" className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
            Kontaktai
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-charcoal">
            Paskambinkite, parašykite arba darbo metu atvykite į aikštelę {cityLocative(site.city)}
            {site.street ? `, ${site.street}` : ''}.
          </p>
        </div>
      </section>

      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-10 lg:col-span-5">
          <ul className="divide-y divide-line border-y border-line">
            <li className="flex gap-4 py-5">
              <Icon name="pin" size={22} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-[13px] font-semibold text-muted">Aikštelė</p>
                <p className="mt-1 text-[17px] font-semibold">{addressLine}</p>
                <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-accent-dark">
                  <span className="link-draw">Rodyti žemėlapyje</span>
                  <span className="sr-only">(atidaroma naujame lange)</span>
                </a>
              </div>
            </li>
            {site.phone && site.phoneHref && (
              <li className="flex gap-4 py-5">
                <Icon name="phone" size={22} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-semibold text-muted">Telefonas</p>
                  <a href={`tel:${site.phoneHref}`} className="mt-1 inline-flex min-h-11 items-center text-[17px] font-semibold">
                    <span className="link-draw">{site.phone}</span>
                  </a>
                </div>
              </li>
            )}
            {site.email && (
              <li className="flex gap-4 py-5">
                <Icon name="mail" size={22} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-semibold text-muted">El. paštas</p>
                  <a href={`mailto:${site.email}`} className="mt-1 inline-flex min-h-11 items-center text-[17px] font-semibold break-all">
                    <span className="link-draw">{site.email}</span>
                  </a>
                </div>
              </li>
            )}
            <li className="flex gap-4 py-5">
              <Icon name="clock" size={22} className="mt-0.5 shrink-0 text-accent" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-muted">Darbo laikas</p>
                <dl className="mt-2 space-y-1.5 text-[16px]">
                  {site.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-6">
                      <dt>{h.days}</dt>
                      <dd className="font-semibold">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          </ul>
          <p className="text-[14px] leading-relaxed text-muted">
            Norėdami apžiūrėti konkretų automobilį, susisiekite iš anksto – taip jis bus paruoštas bandomajam važiavimui.
          </p>
        </div>

        <section id="uzklausa" aria-labelledby="form-title" className="lg:col-span-7">
          <div className="rounded-lg border border-line bg-white p-5 sm:p-8 lg:p-10">
            <h2 id="form-title" className="text-[28px] font-semibold">
              Užklausos forma
            </h2>
            <p className="mt-2 mb-8 text-[15px] text-muted">Atsakome darbo laiku telefonu arba el. paštu – kaip nurodysite.</p>
            <EnquiryForm />
          </div>
        </section>
      </div>
    </div>
  )
}
