import { useState, type FormEvent } from 'react'
import { BsCheck } from 'react-icons/bs'
import { useQuery } from '../../hooks/useQuery.ts'
import { api } from '../../lib/api.ts'
import { cx, money } from '../../lib/format.ts'
import type { Facets } from '../../types.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Field.tsx'

export interface FilterValues {
  min: string
  max: string
  color: string
  sale: boolean
}

interface FilterPanelProps {
  values: FilterValues
  onApply: (values: FilterValues) => void
  onReset: () => void
}

export function FilterPanel({ values, onApply, onReset }: FilterPanelProps) {
  const facets = useQuery('facets', (signal) => api<Facets>('/products/facets', { signal }))
  const [draft, setDraft] = useState(values)

  function submit(event: FormEvent) {
    event.preventDefault()
    onApply(draft)
  }

  return (
    <form
      onSubmit={submit}
      className="grid animate-fade-in gap-[30px] rounded-[5px] border border-gray-2 bg-gray-1 p-[25px] md:grid-cols-[1fr_1.4fr_auto]"
      aria-label="Filter products"
    >
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-h5 text-ink">Price</legend>
        <div className="flex items-start gap-2.5">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            placeholder="Min"
            aria-label="Minimum price in dollars"
            value={draft.min}
            onChange={(event) => setDraft({ ...draft, min: event.target.value })}
            className="bg-white"
            wrapperClassName="flex-1"
          />
          <span className="pt-4 text-h6 text-muted" aria-hidden>
            to
          </span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            placeholder="Max"
            aria-label="Maximum price in dollars"
            value={draft.max}
            onChange={(event) => setDraft({ ...draft, max: event.target.value })}
            className="bg-white"
            wrapperClassName="flex-1"
          />
        </div>
        {facets.data && (
          <p className="text-small">
            Prices range from {money(facets.data.minPrice)} to {money(facets.data.maxPrice)}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-h5 text-ink">Colour</legend>
        <div className="flex flex-wrap gap-2.5">
          {(facets.data?.colors ?? []).map((color) => {
            const selected = draft.color === color.name
            return (
              <button
                key={color.name}
                type="button"
                title={`${color.name} (${color.count})`}
                aria-label={color.name}
                aria-pressed={selected}
                onClick={() => setDraft({ ...draft, color: selected ? '' : color.name })}
                className={cx(
                  'flex size-[30px] items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110',
                  selected && 'ring-2 ring-primary ring-offset-2 ring-offset-gray-1',
                )}
                style={{ backgroundColor: color.hex }}
              >
                {selected && <BsCheck size={20} className="text-white mix-blend-difference" aria-hidden />}
              </button>
            )
          })}
        </div>
        <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-h6 text-ink">
          <input
            type="checkbox"
            checked={draft.sale}
            onChange={(event) => setDraft({ ...draft, sale: event.target.checked })}
            className="size-[18px] cursor-pointer accent-primary"
          />
          On sale only
        </label>
      </fieldset>

      <div className="flex items-end gap-2.5 md:flex-col md:justify-end">
        <Button type="submit" size="sm" className="h-[50px] md:w-full">
          Apply
        </Button>
        <Button
          size="sm"
          variant="outline-primary"
          className="h-[50px] md:w-full"
          onClick={() => {
            setDraft({ min: '', max: '', color: '', sale: false })
            onReset()
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
