import credits from '../data/photo-credits.json'

interface Credit {
  file: string
  title: string
  page: string
  author: string
  license: string
  licenseUrl: string
}

export default function Credits() {
  const list = credits as Credit[]
  return (
    <div className="pt-10 pb-20 lg:pt-16">
      <div className="wrap max-w-4xl">
        <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em]">Nuotraukų šaltiniai</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
          Svetainėje naudojamos nuotraukos iš Wikimedia Commons pagal nurodytas licencijas. Nuotraukos apkirptos ir suspaustos.
        </p>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {list.map((c) => (
            <li key={c.file} className="grid gap-3 py-4 sm:grid-cols-[120px_1fr]">
              <img src={`${c.file}-640.webp`} alt="" loading="lazy" className="aspect-[3/2] w-full rounded object-cover sm:w-[120px]" />
              <div className="text-[14px] leading-relaxed">
                <a href={c.page} target="_blank" rel="noopener noreferrer" className="font-semibold break-words underline underline-offset-2">
                  {c.title}
                </a>
                <p className="text-muted">
                  Autorius: {c.author || 'nenurodytas'} ·{' '}
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
