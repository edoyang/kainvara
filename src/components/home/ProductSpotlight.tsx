import { Link } from 'react-router-dom'
import { useCart } from '../../context/cart.ts'
import { useToast } from '../../context/toast.ts'
import { useProducts } from '../../hooks/useCatalog.ts'
import { img, imgSet, money, seasonLabel } from '../../lib/format.ts'
import type { Product } from '../../types.ts'
import { Button } from '../ui/Button.tsx'
import { Carousel } from '../ui/Carousel.tsx'

function Slide({ product }: { product: Product }) {
  const { add } = useCart()
  const { notify } = useToast()

  function addToCart() {
    add(product)
    notify(`${product.name} was added to your cart`)
  }

  return (
    <div className="bg-secondary">
      <div className="mx-auto grid min-h-[709px] w-full max-w-[1084px] items-end gap-[30px] px-10 pt-[112px] md:px-6 lg:grid-cols-2 lg:pt-0">
        <div className="flex flex-col items-center gap-[30px] self-center pb-10 text-center lg:items-start lg:pb-[60px] lg:text-left">
          <p className="text-h4 text-white">{seasonLabel()}</p>
          <h2 className="text-h2 text-white lg:text-h1">
            <Link to={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h2>
          <p className="max-w-[341px] text-p text-white">{product.summary}</p>
          <div className="flex flex-wrap items-center justify-center gap-[34px]">
            <p className="text-h3 text-white">{money(product.price)}</p>
            <Button variant="success" onClick={addToCart}>
              ADD TO CART
            </Button>
          </div>
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="mx-auto block h-[420px] w-full max-w-[443px] overflow-hidden rounded-t-[220px] bg-white/10 lg:h-[600px]"
          tabIndex={-1}
          aria-hidden
        >
          <img
            src={img(product.images[0] ?? '', 500, 680)}
            srcSet={imgSet(product.images[0] ?? '', 500, 680)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </Link>
      </div>
    </div>
  )
}

// The kit's green "Vita Classic Product" slider, fed by featured products.
export function ProductSpotlight() {
  const { data } = useProducts({ featured: true, sort: 'rating', limit: 3 })
  const products = data?.items ?? []

  if (!products.length) return <div className="min-h-[709px] bg-secondary" aria-hidden />

  return (
    <Carousel
      label="Featured products"
      autoPlayMs={9000}
      slides={products.map((product) => (
        <Slide key={product.id} product={product} />
      ))}
    />
  )
}
