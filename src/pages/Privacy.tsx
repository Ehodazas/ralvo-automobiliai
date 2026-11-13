import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { addressLine, site } from '../config/site'

/** Kiek laiko saugomos užklausos. Pakeiskite pagal įmonės vidaus tvarką. */
const RETENTION_MONTHS = 12
const UPDATED = '2026-11-13'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-[22px] font-semibold">{title}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-charcoal">{children}</div>
    </section>
  )
}

export default function Privacy() {
  const controller = [
    site.legalName ?? site.name,
    site.companyCode ? `įmonės kodas ${site.companyCode}` : null,
    addressLine,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="pt-10 pb-20 lg:pt-16">
      <div className="wrap">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">Privatumo politika</h1>
          <p className="mt-4 text-[15px] text-muted">Atnaujinta {UPDATED}</p>

          <div className="mt-12 space-y-10">
            <Section title="Duomenų valdytojas">
              <p>
                Asmens duomenis, kuriuos pateikiate šioje svetainėje, tvarko {controller}.
                {site.email && (
                  <>
                    {' '}
                    Dėl duomenų tvarkymo rašykite{' '}
                    <a className="font-semibold underline underline-offset-2" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                    .
                  </>
                )}
              </p>
              <p>Duomenis tvarkome pagal Bendrąjį duomenų apsaugos reglamentą (BDAR) ir Lietuvos Respublikos asmens duomenų teisinės apsaugos įstatymą.</p>
            </Section>

            <Section title="Kokius duomenis renkame">
              <p>Pateikdami užklausą ar rezervaciją nurodote:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>vardą;</li>
                <li>telefono numerį ir (arba) el. pašto adresą;</li>
                <li>žinutės tekstą ir automobilį (-ius), dėl kurio kreipiatės;</li>
                <li>rezervacijos atveju – pageidaujamą apžiūros dieną ir laiką.</li>
              </ul>
              <p>
                Siekdamas apsaugoti formą nuo piktnaudžiavimo, serveris trumpam įsimena užklausą siuntusio įrenginio IP adresą. Jis nesaugomas kartu su
                užklausa ir automatiškai pamirštamas po 10 minučių.
              </p>
            </Section>

            <Section title="Kam naudojame duomenis ir kuo remiamės">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Atsakyti į užklausą, patvirtinti rezervaciją ir suderinti automobilio apžiūrą.</strong> Teisinis pagrindas – veiksmai jūsų prašymu prieš sudarant sutartį (BDAR
                  6 str. 1 d. b p.).
                </li>
                <li>
                  <strong>Apsaugoti svetainę nuo šlamšto ir piktnaudžiavimo.</strong> Teisinis pagrindas – teisėtas interesas (BDAR 6 str. 1 d. f p.).
                </li>
              </ul>
              <p>Duomenų nenaudojame tiesioginei rinkodarai ir neperduodame jų kitiems pardavėjams.</p>
            </Section>

            <Section title="Kiek laiko saugome">
              <p>
                Užklausas saugome {RETENTION_MONTHS} mėnesių nuo paskutinio susirašinėjimo. Jei sudaroma pirkimo–pardavimo sutartis, su ja susiję duomenys
                saugomi tiek, kiek reikalauja buhalterinės apskaitos ir mokesčių teisės aktai.
              </p>
            </Section>

            <Section title="Kas gali gauti duomenis">
              <p>
                Duomenis gali tvarkyti tik paslaugų teikėjai, be kurių svetainė neveiktų: svetainės prieglobos ir el. pašto paslaugų teikėjai. Jie duomenis
                tvarko tik pagal mūsų nurodymus ir negali jų naudoti savo tikslais.
              </p>
            </Section>

            <Section title="Slapukai ir trečiųjų šalių paslaugos">
              <p>
                Ši svetainė nenaudoja slapukų, analitikos ar reklamos įrankių, todėl sutikimo juostos nėra. Šriftai ir nuotraukos talpinami pačioje svetainėje.
              </p>
              <p>
                Jūsų pažymėti patinkantys automobiliai ir krepšelio turinys saugomi tik jūsų naršyklėje (vietinėje saugykloje, „localStorage“). Šie
                sąrašai mums nesiunčiami, kol patys nepateikiate rezervacijos. Juos ištrinsite išvalę sąrašą svetainėje arba naršyklės duomenis.
              </p>
              <p>
                Nuoroda „Rodyti žemėlapyje“ atidaro OpenStreetMap svetainę naujame lange. Joje taikoma{' '}
                <a
                  className="font-semibold underline underline-offset-2"
                  href="https://osmfoundation.org/wiki/Privacy_Policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap Foundation privatumo politika
                </a>
                .
              </p>
            </Section>

            <Section title="Jūsų teisės">
              <p>Turite teisę:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>sužinoti, kokius jūsų duomenis tvarkome, ir gauti jų kopiją;</li>
                <li>prašyti ištaisyti netikslius duomenis;</li>
                <li>prašyti ištrinti duomenis arba apriboti jų tvarkymą;</li>
                <li>nesutikti, kad duomenys būtų tvarkomi remiantis teisėtu interesu;</li>
                <li>gauti savo pateiktus duomenis įprastu kompiuterio skaitomu formatu.</li>
              </ul>
              <p>
                Į prašymą atsakysime ne vėliau kaip per vieną mėnesį. Jei manote, kad duomenys tvarkomi neteisėtai, galite pateikti skundą Valstybinei duomenų
                apsaugos inspekcijai (
                <a className="font-semibold underline underline-offset-2" href="https://vdai.lrv.lt" target="_blank" rel="noopener noreferrer">
                  vdai.lrv.lt
                </a>
                ).
              </p>
            </Section>

            <Section title="Kontaktai">
              <p>
                Klausimus dėl šios politikos siųskite{' '}
                <Link to="/kontaktai#uzklausa" className="font-semibold underline underline-offset-2">
                  per užklausos formą
                </Link>
                {site.email && (
                  <>
                    {' '}
                    arba el. paštu{' '}
                    <a className="font-semibold underline underline-offset-2" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                  </>
                )}
                .
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
