import { cx } from '../../lib/format.ts'
import type { Product } from '../../types.ts'
import { ErrorState } from '../ui/States.tsx'
import { ProductCard, ProductCardSkeleton, type CardVariant } from './ProductCard.tsx'

interface ProductGridProps {
  products: Product[] | undefined
  loading: boolean
  error: string | null
  onRetry?: () => void
  variant?: CardVariant
  // How many placeholders to show while the first page loads.
  placeholders?: number
  columns?: 4 | 5
  className?: string
}

export function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  variant = 'standard',
  placeholders = 8,
  columns = 4,
  className,
}: ProductGridProps) {
  if (error && !products) return <ErrorState message={error} onRetry={onRetry} />

  const grid = cx(
    'grid grid-cols-1 gap-[30px] xs:grid-cols-2 md:grid-cols-3',
    columns === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4',
    className,
  )

  if (!products) {
    return (
      <div className={grid} aria-busy="true">
        {Array.from({ length: placeholders }, (_, index) => (
          <ProductCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    )
  }

  return (
    <ul className={cx(grid, loading && 'opacity-60 transition-opacity')}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} variant={variant} />
        </li>
      ))}
    </ul>
  )
}
