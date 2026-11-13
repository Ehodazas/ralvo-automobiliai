import { useId, type ReactNode } from 'react'
import { formatNumber } from '../lib/format'
import { makes, modelsFor, vehicles, yearRange, type Filters } from '../lib/inventory'
import { bodyLabels, driveLabels, fuelLabels, gearboxLabels } from '../lib/labels'

interface Props {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}

const PRICE_STEPS = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000]
const MILEAGE_STEPS = [30000, 60000, 100000, 150000, 200000]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="float-left mb-3 w-full text-[14px] font-semibold">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  )
}

function Checks<T extends string>({
  name,
  labels,
  selected,
  onToggle,
  pick,
}: {
  name: string
  labels: Record<T, string>
  selected: T[]
  onToggle: (v: T[]) => void
  pick: (v: (typeof vehicles)[number]) => T
}) {
  const present = (Object.keys(labels) as T[]).filter((k) => vehicles.some((v) => pick(v) === k))
  return (
    <ul className="space-y-0.5">
      {present.map((k) => {
        const count = vehicles.filter((v) => v.status !== 'sold' && pick(v) === k).length
        const checked = selected.includes(k)
        return (
          <li key={k}>
            <label className="group flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                name={name}
                value={k}
                checked={checked}
                onChange={() => onToggle(checked ? selected.filter((s) => s !== k) : [...selected, k])}
                className="size-[18px] rounded-[4px] accent-ink"
              />
              <span className="flex-1">{labels[k]}</span>
              <span className="text-[13px] text-muted tabular-nums">{count}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

export function FilterPanel({ filters: f, onChange }: Props) {
  const id = useId()
  const { min, max } = yearRange()
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  const numOrNull = (s: string) => (s ? Number(s) : null)

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${id}-q`} className="field-label">
          Paieška
        </label>
        <input
          id={`${id}-q`}
          type="search"
          value={f.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Pvz. Volvo universalas"
          className="field"
          enterKeyHint="search"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor={`${id}-make`} className="field-label">
            Markė
          </label>
          <select
            id={`${id}-make`}
            className="field"
            value={f.marke}
            onChange={(e) => onChange({ marke: e.target.value, modelis: '' })}
          >
            <option value="">Visos markės</option>
            {makes().map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-model`} className="field-label">
            Modelis
          </label>
          <select
            id={`${id}-model`}
            className="field disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
            value={f.modelis}
            disabled={!f.marke}
            onChange={(e) => onChange({ modelis: e.target.value })}
          >
            <option value="">{f.marke ? 'Visi modeliai' : 'Pirmiausia pasirinkite markę'}</option>
            {f.marke &&
              modelsFor(f.marke).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>
      </div>

      <Group title="Kaina, €">
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="Kaina nuo" className="field" value={f.kainaNuo ?? ''} onChange={(e) => onChange({ kainaNuo: numOrNull(e.target.value) })}>
            <option value="">Nuo</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                {formatNumber(p)}
              </option>
            ))}
          </select>
          <select aria-label="Kaina iki" className="field" value={f.kainaIki ?? ''} onChange={(e) => onChange({ kainaIki: numOrNull(e.target.value) })}>
            <option value="">Iki</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                {formatNumber(p)}
              </option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Pagaminimo metai">
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="Metai nuo" className="field" value={f.metaiNuo ?? ''} onChange={(e) => onChange({ metaiNuo: numOrNull(e.target.value) })}>
            <option value="">Nuo</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select aria-label="Metai iki" className="field" value={f.metaiIki ?? ''} onChange={(e) => onChange({ metaiIki: numOrNull(e.target.value) })}>
            <option value="">Iki</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Rida">
        <select aria-label="Rida iki" className="field" value={f.ridaIki ?? ''} onChange={(e) => onChange({ ridaIki: numOrNull(e.target.value) })}>
          <option value="">Bet kokia</option>
          {MILEAGE_STEPS.map((m) => (
            <option key={m} value={m}>
              iki {formatNumber(m)} km
            </option>
          ))}
        </select>
      </Group>

      <Group title="Kuro tipas">
        <Checks name="kuras" labels={fuelLabels} selected={f.kuras} onToggle={(kuras) => onChange({ kuras })} pick={(v) => v.fuel} />
      </Group>

      <Group title="Pavarų dėžė">
        <Checks name="pavaros" labels={gearboxLabels} selected={f.pavaros} onToggle={(pavaros) => onChange({ pavaros })} pick={(v) => v.gearbox} />
      </Group>

      <Group title="Kėbulo tipas">
        <Checks name="kebulas" labels={bodyLabels} selected={f.kebulas} onToggle={(kebulas) => onChange({ kebulas })} pick={(v) => v.body} />
      </Group>

      <Group title="Varantieji ratai">
        <Checks name="varantieji" labels={driveLabels} selected={f.varantieji} onToggle={(varantieji) => onChange({ varantieji })} pick={(v) => v.drive} />
      </Group>

      <div className="border-t border-line pt-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={f.parduoti}
            onChange={(e) => onChange({ parduoti: e.target.checked })}
            className="size-[18px] rounded-[4px] accent-ink"
          />
          Rodyti ir parduotus automobilius
        </label>
      </div>
    </div>
  )
}
