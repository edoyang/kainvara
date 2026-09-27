import { cx } from '../../lib/format.ts'

interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
}

// Up to three numbered cells, centred on the current page, like the kit.
function windowOf(page: number, pages: number): number[] {
  const size = Math.min(3, pages)
  const start = Math.max(1, Math.min(page - 1, pages - size + 1))
  return Array.from({ length: size }, (_, index) => start + index)
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  const edge = (disabled: boolean) =>
    cx(
      'px-4 py-[25px] text-h6 transition-colors sm:px-[25px]',
      disabled ? 'cursor-not-allowed bg-[#f3f3f3] text-muted' : 'bg-white text-primary hover:bg-gray-1',
    )

  return (
    <nav aria-label="Pagination" className="flex justify-center">
      <ul className="flex overflow-hidden rounded-[7px] border border-muted bg-white shadow-light">
        <li>
          <button type="button" disabled={page === 1} onClick={() => onChange(1)} className={edge(page === 1)}>
            First
          </button>
        </li>
        {windowOf(page, pages).map((number) => (
          <li key={number} className="border-l border-[#e9e9e9]">
            <button
              type="button"
              onClick={() => onChange(number)}
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Page ${number}`}
              className={cx(
                'px-4 py-[25px] text-h6 transition-colors sm:px-5',
                number === page ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-gray-1',
              )}
            >
              {number}
            </button>
          </li>
        ))}
        <li className="border-l border-[#e9e9e9]">
          <button
            type="button"
            disabled={page === pages}
            onClick={() => onChange(page + 1)}
            className={edge(page === pages)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  )
}
