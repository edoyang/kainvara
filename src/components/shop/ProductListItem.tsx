import { BsCart, BsChevronRight, BsDownload, BsHeart, BsHeartFill, BsStarFill } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/cart.ts'
import { useToast } from '../../context/toast.ts'
import { useWishlist } from '../../context/wishlist.ts'
import { cx, img, imgSet, plural } from '../../lib/format.ts'
import type { Product } from '../../types.ts'
import { Prices } from '../product/ProductCard.tsx'

// The kit's "Horizental Product card", used for the list view of the shop.
export function ProductListItem({ product }: { product: Product }) {
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { notify } = useToast()
  const href = `/product/${product.slug}`
  const liked = has(product.id)
  const soldOut = product.stock < 1
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price

  const action =
    'flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-light transition-colors hover:bg-primary hover:text-white disabled:opacity-50'

  return (
    <article className="group flex flex-col bg-white shadow-light sm:flex-row">
      <div className="relative h-[300px] shrink-0 overflow-hidden bg-gray-2 sm:h-auto sm:min-h-[340px] sm:w-[209px]">
        <Link to={href} tabIndex={-1} aria-hidden>
          <img
            src={img(product.images[0] ?? '', 420, 680)}
            srcSet={imgSet(product.images[0] ?? '', 420, 680)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              notify(toggle(product.id) ? `${product.name} was saved to your wishlist` : 'Removed from your wishlist', 'info')
            }
            aria-pressed={liked}
            aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={cx(action, liked && 'text-danger')}
          >
            {liked ? <BsHeartFill size={16} /> : <BsHeart size={16} />}
          </button>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              add(product)
              notify(`${product.name} was added to your cart`)
            }}
            aria-label={`Add ${product.name} to cart`}
            className={action}
          >
            <BsCart size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-2.5 px-[25px] pt-[25px] pb-[35px]">
        <div className="flex w-full items-center justify-between gap-2.5">
          <Link to={`/shop/${product.category.slug}`} className="text-h6 text-primary hover:text-primary-hover">
            {product.department || product.category.name}
          </Link>
          <span className="flex items-center gap-[5px] rounded-[20px] bg-dark p-[5px] pr-2 text-small text-white">
            <BsStarFill size={14} className="text-[#ffce31]" aria-hidden />
            <span className="sr-only">Rated</span>
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-h5">
          <Link to={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="text-p">{product.summary}</p>
        <p className="flex items-center gap-2.5 text-h6 text-body">
          <BsDownload size={16} className="text-body" aria-hidden />
          {plural(product.salesCount, 'Sale')}
        </p>
        <Prices product={product} />
        {product.colors.length > 0 && (
          <ul className="flex gap-1.5" aria-label="Available colours">
            {product.colors.map((color) => (
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
        <Link
          to={href}
          className="mt-auto inline-flex items-center gap-2.5 rounded-[37px] border border-primary px-5 py-2.5 text-h6 text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Learn More
          <BsChevronRight size={14} aria-hidden />
          <span className="sr-only">about {product.name}</span>
        </Link>
      </div>
    </article>
  )
}
