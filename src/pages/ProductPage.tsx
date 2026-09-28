import { useState } from 'react'
import { BsCart, BsDash, BsEyeFill, BsHeart, BsHeartFill, BsPlus } from 'react-icons/bs'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PromiseStrip } from '../components/layout/StorePromises.tsx'
import { Gallery } from '../components/product/Gallery.tsx'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { ProductTabs } from '../components/product/ProductTabs.tsx'
import { Seo } from '../components/Seo.tsx'
import { Breadcrumb } from '../components/ui/Breadcrumb.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { Stars } from '../components/ui/Stars.tsx'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States.tsx'
import { useCart } from '../context/cart.ts'
import { useToast } from '../context/toast.ts'
import { useWishlist } from '../context/wishlist.ts'
import { useQuery } from '../hooks/useQuery.ts'
import { api } from '../lib/api.ts'
import { cx, discountPercent, img, money, plural } from '../lib/format.ts'
import { breadcrumbData, productData } from '../lib/structuredData.ts'
import type { Product } from '../types.ts'

interface ProductResponse {
  product: Product
  related: Product[]
}

function Loading() {
  return (
    <section className="bg-gray-1 pb-12">
      <div className="container-x grid gap-[30px] lg:grid-cols-2" aria-busy="true">
        <Skeleton className="h-[300px] sm:h-[450px]" />
        <div className="flex flex-col gap-4 lg:px-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    </section>
  )
}

interface DetailsProps {
  product: Product
  related: Product[]
  onReviewChange: () => void
}

function Details({ product, related, onReviewChange }: DetailsProps) {
  const navigate = useNavigate()
  const { add, lines } = useCart()
  const { has, toggle } = useWishlist()
  const { notify } = useToast()

  const [color, setColor] = useState(product.colors[0]?.name ?? '')
  const [size, setSize] = useState(product.sizes[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)

  const liked = has(product.id)
  const inStock = product.stock > 0
  const lowStock = inStock && product.stock <= 5
  const saving = discountPercent(product.price, product.compareAtPrice)
  const inCart = lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0)
  const maxQuantity = Math.max(1, Math.min(product.stock, 99))

  function addToCart() {
    add(product, { quantity, color, size })
    notify(`${quantity} x ${product.name} added to your cart`)
  }

  const circle =
    'flex size-10 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white'

  return (
    <>
      <section className="bg-gray-1 pb-12">
        <div className="container-x grid gap-[30px] lg:grid-cols-2">
          <Gallery images={product.images} name={product.name} zoomOpen={zoomOpen} onZoomChange={setZoomOpen} />

          <div className="flex flex-col lg:px-6 lg:pt-[11px]">
            <h1 className="text-h4 text-ink">{product.name}</h1>

            <a href="#details" className="mt-3 flex flex-wrap items-center gap-2.5">
              <Stars rating={product.rating} />
              <span className="text-h6 text-body">{plural(product.reviewCount, 'Review')}</span>
            </a>

            <p className="mt-5 flex flex-wrap items-baseline gap-2.5">
              <span className="text-h3 text-ink">{money(product.price)}</span>
              {saving > 0 && product.compareAtPrice !== null && (
                <>
                  <s className="text-h5 text-muted">{money(product.compareAtPrice)}</s>
                  <span className="rounded-[3px] bg-danger px-2 text-h6 text-white">Save {saving}%</span>
                </>
              )}
            </p>

            <p className="mt-[5px] flex gap-[5px] text-h6">
              <span className="text-body">Availability :</span>
              <span className={inStock ? (lowStock ? 'text-alert' : 'text-primary') : 'text-danger'}>
                {inStock ? (lowStock ? `Only ${product.stock} left` : 'In Stock') : 'Sold Out'}
              </span>
            </p>

            <p className="mt-8 text-p text-[#858585]">{product.summary}</p>

            <hr className="mt-[27px] mb-[29px] border-muted" />

            {product.colors.length > 0 && (
              <fieldset>
                <legend className="mb-2.5 text-h6 text-body">
                  Colour : <span className="text-ink">{color}</span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      title={option.name}
                      aria-label={option.name}
                      aria-pressed={color === option.name}
                      onClick={() => setColor(option.name)}
                      className={cx(
                        'size-[30px] rounded-full border border-black/10 transition-transform hover:scale-110',
                        color === option.name && 'ring-2 ring-primary ring-offset-2 ring-offset-gray-1',
                      )}
                      style={{ backgroundColor: option.hex }}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {product.sizes.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-2.5 text-h6 text-body">
                  Size : <span className="text-ink">{size}</span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={size === option}
                      onClick={() => setSize(option)}
                      className={cx(
                        'min-w-11 rounded-[5px] border px-3 py-2 text-h6 transition-colors',
                        size === option
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-2 bg-white text-ink hover:border-primary hover:text-primary',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <div className="flex h-11 items-center rounded-[5px] border border-gray-2 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={!inStock || quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-full w-10 items-center justify-center text-ink hover:text-primary disabled:text-muted"
                >
                  <BsDash size={20} />
                </button>
                <output className="w-8 text-center text-h6 text-ink" aria-label="Quantity">
                  {quantity}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                  disabled={!inStock || quantity >= maxQuantity}
                  aria-label="Increase quantity"
                  className="flex h-full w-10 items-center justify-center text-ink hover:text-primary disabled:text-muted"
                >
                  <BsPlus size={20} />
                </button>
              </div>

              <Button size="sm" onClick={addToCart} disabled={!inStock}>
                {inStock ? 'Add to Cart' : 'Sold Out'}
              </Button>

              <button
                type="button"
                onClick={() =>
                  notify(toggle(product.id) ? 'Saved to your wishlist' : 'Removed from your wishlist', 'info')
                }
                aria-pressed={liked}
                aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
                className={cx(circle, liked && 'text-danger')}
              >
                {liked ? <BsHeartFill size={18} /> : <BsHeart size={18} />}
              </button>
              <button type="button" onClick={() => navigate('/cart')} aria-label="Go to cart" className={circle}>
                <BsCart size={18} />
              </button>
              <button type="button" onClick={() => setZoomOpen(true)} aria-label="Zoom photo" className={circle}>
                <BsEyeFill size={18} />
              </button>
            </div>

            {inCart > 0 && (
              <p className="mt-4 text-h6 text-body">
                {inCart} already in your cart.{' '}
                <Link to="/cart" className="text-primary hover:text-primary-hover">
                  View cart
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <ProductTabs product={product} onReviewChange={onReviewChange} />

      {related.length > 0 && (
        <section className="bg-gray-1 py-12">
          <div className="container-x flex flex-col gap-6">
            <h2 className="text-h3">BESTSELLER PRODUCTS</h2>
            <hr className="border-t-2 border-gray-2" />
            <ProductGrid products={related} loading={false} error={null} variant="compact" className="gap-y-6" />
          </div>
        </section>
      )}
    </>
  )
}

export default function ProductPage() {
  const { slug = '' } = useParams()
  const path = `/products/${encodeURIComponent(slug)}`
  const { data, error, reload } = useQuery(path, (signal) => api<ProductResponse>(path, { signal }))
  const product = data?.product

  return (
    <>
      <Seo
        title={product ? product.name : 'Product'}
        description={
          product &&
          `${product.summary} ${money(product.price)} at Kainvara, with free delivery over $50 and 30 day returns.`
        }
        image={product?.images[0] ? img(product.images[0], 1200, 630) : undefined}
        type={product ? 'product' : 'website'}
        noindex={Boolean(error) && !product}
        jsonLd={
          product && [
            productData(product),
            breadcrumbData([
              { name: 'Shop', path: '/shop' },
              { name: product.category.name, path: `/shop/${product.category.slug}` },
              { name: product.name, path: `/product/${product.slug}` },
            ]),
          ]
        }
      />

      <section className="bg-gray-1">
        <div className="container-x py-6">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              ...(product
                ? [{ label: product.category.name, to: `/shop/${product.category.slug}` }, { label: product.name }]
                : []),
            ]}
          />
        </div>
      </section>

      {error && !data ? (
        error === 'Product not found' ? (
          <EmptyState
            className="bg-gray-1"
            title="This product is no longer available"
            message="It may have sold out for good, or the link is out of date."
            action={<ButtonLink to="/shop">Browse the shop</ButtonLink>}
          />
        ) : (
          <ErrorState message={error} onRetry={reload} className="bg-gray-1" />
        )
      ) : !product ? (
        <Loading />
      ) : (
        // Keyed by product so the chosen options reset when moving between products.
        <Details key={product.id} product={product} related={data.related} onReviewChange={reload} />
      )}

      <PromiseStrip />
    </>
  )
}
