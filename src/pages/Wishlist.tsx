import { BsHeart } from 'react-icons/bs'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { EmptyState } from '../components/ui/States.tsx'
import { Seo } from '../components/Seo.tsx'
import { useAuth } from '../context/auth.ts'
import { useWishlist } from '../context/wishlist.ts'
import { useQuery } from '../hooks/useQuery.ts'
import { api } from '../lib/api.ts'
import { plural } from '../lib/format.ts'
import type { Product } from '../types.ts'

export default function Wishlist() {
  const { user } = useAuth()
  const { ids } = useWishlist()
  const key = ids.length ? `wishlist:${ids.join(',')}` : null
  const { data, loading, error, reload } = useQuery(
    key,
    (signal) => api<Product[]>('/wishlist/resolve', { method: 'POST', body: { ids }, signal }),
    { keepPrevious: true },
  )
  // Hides a card the moment it is removed, before the refreshed list arrives.
  const products = data?.filter((product) => ids.includes(product.id))

  return (
    <>
      <Seo title="Wishlist" noindex />
      <PageHeader title="Wishlist" crumbs={[{ label: 'Wishlist' }]} />

      <section className="bg-white">
        <div className="container-x flex flex-col gap-8 py-12">
          {ids.length === 0 ? (
            <EmptyState
              icon={<BsHeart />}
              title="Your wishlist is empty"
              message="Tap the heart on any product to save it here for later."
              action={<ButtonLink to="/shop">Find something you love</ButtonLink>}
            />
          ) : (
            <>
              <p className="text-h6 text-body">
                {plural(ids.length, 'saved item')}
                {!user && '. Sign in to keep your wishlist on every device.'}
              </p>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                onRetry={reload}
                placeholders={Math.min(ids.length, 8)}
                className="gap-y-12"
              />
            </>
          )}
        </div>
      </section>
    </>
  )
}
