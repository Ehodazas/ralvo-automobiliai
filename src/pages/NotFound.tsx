import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="wrap py-24 lg:py-36" aria-labelledby="nf-title">
      <p className="font-display text-[15px] font-semibold text-accent">404</p>
      <h1 id="nf-title" className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">
        Puslapis nerastas
      </h1>
      <p className="mt-4 max-w-md text-[17px] text-muted">
        Galbūt skelbimas buvo pašalintas arba nuoroda įvesta su klaida.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/automobiliai" className="btn btn-primary">
          Žiūrėti visus automobilius
        </Link>
        <Link to="/" className="btn btn-secondary">
          Grįžti į pradžią
        </Link>
      </div>
    </section>
  )
}
