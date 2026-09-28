import { BsCart, BsEye, BsHeart, BsHeartFill } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/cart.ts'
import { useToast } from '../../context/toast.ts'
import { useWishlist } from '../../context/wishlist.ts'
import { cx, img, imgSet, money } from '../../lib/format.ts'
import type { Product } from '../../types.ts'
import { Skeleton } from '../ui/States.tsx'

// tall: home bestsellers (427px cover), standard: shop grid (300px),
// compact: white, left aligned card used under a product (280px).
export type CardVariant = 'tall' | 'standard' | 'compact' | 'mini'

const COVER: Record<CardVariant, { className: string; height: number }> = {
  tall: { className: 'h-[427px]', height: 427 },
  standard: { className: 'h-[300px]', height: 300 },
  compact: { className: 'h-[280px]', height: 280 },
  mini: { className: 'h-[238px]', height: 238 },
}

export function Prices({ product, className }: { product: Pick<Product, 'price' | 'compareAtPrice'>; className?: string }) {
  return (
    <p className={cx('flex gap-[5px] px-[3px] py-[5px] text-h5', className)}>
      {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
        <s className="text-muted no-underline">
          <span className="sr-only">Was </span>
          {money(product.compareAtPrice)}
        </s>
      )}
      <span className="text-secondary">{money(product.price)}</span>
    </p>
  )
}

interface ProductCardProps {
  product: Product
  variant?: CardVariant
}

export function ProductCard({ product, variant = 'standard' }: ProductCardProps) {
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { notify } = useToast()
  const cover = COVER[variant]
  const centred = variant === 'tall' || variant === 'standard' || variant === 'mini'
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price
  const soldOut = product.stock < 1
  const liked = has(product.id)
  const href = `/product/${product.slug}`

  function addToCart() {
    add(product)
    notify(`${product.name} was added to your cart`)
  }

  function toggleWishlist() {
    notify(toggle(product.id) ? `${product.name} was saved to your wishlist` : 'Removed from your wishlist', 'info')
  }

  const action =
    'flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-light transition-colors hover:bg-primary hover:text-white disabled:opacity-50'

  return (
    <article className={cx('group flex h-full flex-col', variant === 'compact' ? 'bg-white' : 'bg-white')}>
      <div className={cx('relative overflow-hidden bg-gray-2', cover.className)}>
        <Link to={href} tabIndex={-1} aria-hidden>
          <img
            src={img(product.images[0] ?? '', 360, Math.round((cover.height * 360) / 239))}
            srcSet={imgSet(product.images[0] ?? '', 360, Math.round((cover.height * 360) / 239))}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {(onSale || soldOut) && (
          <span
            className={cx(
              'absolute top-5 left-5 rounded-[3px] px-2.5 text-h6 text-white shadow-light',
              soldOut ? 'bg-dark' : 'bg-danger',
            )}
          >
            {soldOut ? 'Sold out' : 'Sale'}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-6 flex translate-y-2 justify-center gap-2.5 opacity-0 transition duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <button
            type="button"
            onClick={toggleWishlist}
            aria-pressed={liked}
            aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={cx(action, liked && 'text-danger')}
          >
            {liked ? <BsHeartFill size={16} /> : <BsHeart size={16} />}
          </button>
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            className={action}
          >
            <BsCart size={16} />
          </button>
          <Link to={href} aria-label={`View ${product.name}`} className={action}>
            <BsEye size={16} />
          </Link>
        </div>
      </div>

      <div
        className={cx(
          'flex flex-1 flex-col gap-2.5 px-[25px] pt-[25px] pb-[35px]',
          centred ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        <h3 className="text-h5">
          <Link to={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="text-h6 text-body">{product.department}</p>
        <Prices product={product} />
        {product.colors.length > 0 && variant !== 'compact' && variant !== 'mini' && (
          <ul className="flex gap-1.5" aria-label="Available colours">
            {product.colors.slice(0, 5).map((color) => (
              <li
                key={color.name}
                title={color.name}
                className="size-4 rounded-full border border-black/10"
                style={{ backgroundColor: color.hex }}
              >
                <span className="sr-only">{color.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export function ProductCardSkeleton({ variant = 'standard' }: { variant?: CardVariant }) {
  return (
    <div className="flex flex-col">
      <Skeleton className={cx('rounded-none', COVER[variant].className)} />
      <div className="flex flex-col items-center gap-3 px-[25px] pt-[25px] pb-[35px]">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  )
}
