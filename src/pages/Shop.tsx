import { useRef, useState } from 'react'
import { BsGridFill, BsListCheck, BsX } from 'react-icons/bs'
import { useParams, useSearchParams } from 'react-router-dom'
import { PromiseStrip } from '../components/layout/StorePromises.tsx'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { CategoryCards } from '../components/shop/CategoryCards.tsx'
import { FilterPanel, type FilterValues } from '../components/shop/FilterPanel.tsx'
import { ProductListItem } from '../components/shop/ProductListItem.tsx'
import { Breadcrumb } from '../components/ui/Breadcrumb.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Select } from '../components/ui/Field.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { EmptyState } from '../components/ui/States.tsx'
import { useCategories, useProducts } from '../hooks/useCatalog.ts'
import { cx } from '../lib/format.ts'
import { pageTitle } from '../lib/site.ts'

const PAGE_SIZE = 12

const SORTS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

function toCents(value: string): number | undefined {
  const amount = Number(value)
  return value.trim() && Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : undefined
}

export default function Shop() {
  const { category } = useParams()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const categories = useCategories()

  const q = params.get('q')?.trim() ?? ''
  const sort = SORTS.some((option) => option.value === params.get('sort')) ? params.get('sort')! : 'popularity'
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1))
  const view = params.get('view') === 'list' ? 'list' : 'grid'
  const filters: FilterValues = {
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    color: params.get('color') ?? '',
    sale: params.get('sale') === '1',
  }

  const { data, loading, error, reload } = useProducts({
    category,
    q: q || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
    minPrice: toCents(filters.min),
    maxPrice: toCents(filters.max),
    color: filters.color || undefined,
    sale: filters.sale,
  })

  // Changing anything other than the page goes back to page one.
  function update(changes: Record<string, string | null>, keepPage = false) {
    const next = new URLSearchParams(params)
    if (!keepPage) next.delete('page')
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { preventScrollReset: true })
  }

  function changePage(next: number) {
    update({ page: next > 1 ? String(next) : null }, true)
    resultsRef.current?.scrollIntoView({ block: 'start' })
  }

  const current = categories.data?.find((item) => item.slug === category)
  const title = current?.name ?? (category ? 'Shop' : q ? 'Search' : 'Shop')
  const chips = [
    q && { key: 'q', label: `Search: ${q}` },
    (filters.min || filters.max) && {
      key: 'price',
      label: `Price: ${filters.min ? `$${filters.min}` : 'any'} to ${filters.max ? `$${filters.max}` : 'any'}`,
    },
    filters.color && { key: 'color', label: `Colour: ${filters.color}` },
    filters.sale && { key: 'sale', label: 'On sale' },
  ].filter((chip): chip is { key: string; label: string } => Boolean(chip))

  function removeChip(key: string) {
    if (key === 'price') update({ min: null, max: null })
    else update({ [key]: null })
  }

  const total = data?.total ?? 0
  const first = total ? (data!.page - 1) * PAGE_SIZE + 1 : 0
  const last = total ? Math.min(data!.page * PAGE_SIZE, total) : 0
  const summary = !data
    ? 'Loading products'
    : total === 0
      ? 'No results'
      : total <= PAGE_SIZE
        ? `Showing all ${total} results`
        : `Showing ${first} to ${last} of ${total} results`

  const viewButton = (active: boolean) =>
    cx(
      'flex size-[46px] items-center justify-center rounded-[5px] border transition-colors',
      active ? 'border-primary text-primary' : 'border-gray-2 text-ink hover:border-primary hover:text-primary',
    )

  return (
    <>
      <title>{pageTitle(title)}</title>

      <section className="bg-gray-1">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <h1 className="text-h3">{title}</h1>
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              current ? { label: 'Shop', to: '/shop' } : { label: 'Shop' },
              ...(current ? [{ label: current.name }] : []),
            ]}
          />
        </div>
      </section>

      <CategoryCards active={category} />

      <section className="bg-white" ref={resultsRef}>
        <div className="container-x flex flex-col gap-6 py-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-h6 text-body" role="status">
              {summary}
            </p>

            <div className="flex items-center gap-[15px]">
              <span className="text-h6 text-body">Views:</span>
              <button
                type="button"
                onClick={() => update({ view: null }, true)}
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
                className={viewButton(view === 'grid')}
              >
                <BsGridFill size={16} />
              </button>
              <button
                type="button"
                onClick={() => update({ view: 'list' }, true)}
                aria-label="List view"
                aria-pressed={view === 'list'}
                className={viewButton(view === 'list')}
              >
                <BsListCheck size={18} />
              </button>
            </div>

            <div className="flex items-center gap-[15px]">
              <Select
                aria-label="Sort products"
                value={sort}
                onChange={(event) => update({ sort: event.target.value === 'popularity' ? null : event.target.value })}
                className="min-w-[141px]"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                className="h-[50px]"
                aria-expanded={filtersOpen}
                aria-controls="shop-filters"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                Filter
              </Button>
            </div>
          </div>

          {filtersOpen && (
            <div id="shop-filters">
              <FilterPanel
                // Remounting on a URL change keeps the draft in step with the applied values.
                key={params.toString()}
                values={filters}
                onApply={(values) =>
                  update({
                    min: values.min.trim() || null,
                    max: values.max.trim() || null,
                    color: values.color || null,
                    sale: values.sale ? '1' : null,
                  })
                }
                onReset={() => update({ min: null, max: null, color: null, sale: null })}
              />
            </div>
          )}

          {chips.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2.5" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="flex items-center gap-1 rounded-[37px] bg-primary-faded py-1 pr-2 pl-4 text-h6 text-primary hover:bg-primary hover:text-white"
                  >
                    {chip.label}
                    <BsX size={20} aria-hidden />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x flex flex-col gap-12 py-12">
          {data && data.items.length === 0 ? (
            <EmptyState
              title="Nothing matches yet"
              message="Try a different search, or remove a filter to see more products."
              action={
                <Button size="sm" onClick={() => setParams({}, { preventScrollReset: true })}>
                  Clear all filters
                </Button>
              }
            />
          ) : view === 'list' && data ? (
            <ul className={cx('grid gap-[30px] lg:grid-cols-2', loading && 'opacity-60 transition-opacity')}>
              {data.items.map((product) => (
                <li key={product.id}>
                  <ProductListItem product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <ProductGrid
              products={data?.items}
              loading={loading}
              error={error}
              onRetry={reload}
              placeholders={PAGE_SIZE}
              className="gap-y-12"
            />
          )}

          {data && <Pagination page={data.page} pages={data.pages} onChange={changePage} />}
        </div>
      </section>

      <PromiseStrip />
    </>
  )
}
