import { useState } from 'react'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { FeaturedPosts } from '../components/home/FeaturedPosts.tsx'
import { PromiseStrip } from '../components/layout/StorePromises.tsx'
import { Prices } from '../components/product/ProductCard.tsx'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { Carousel } from '../components/ui/Carousel.tsx'
import { Skeleton } from '../components/ui/States.tsx'
import { useCategories, useProducts } from '../hooks/useCatalog.ts'
import { cx, img, imgSet, plural } from '../lib/format.ts'
import { photo, site } from '../lib/site.ts'
import type { Category } from '../types.ts'

const SLIDES = [
  {
    image: photo('1441984904996-e0b6ba687e04'),
    title: 'STYLE DELIVERED',
    text: 'Everything you need for the week ahead, packed with care and sent straight to your door.',
  },
  {
    image: photo('1472851294608-062f824d29cc'),
    title: 'OPEN ALL HOURS',
    text: 'Order tonight and have it at your door in as little as one business day.',
  },
]

// The kit's "desktop-shop-header-3" slide: centred copy over a dimmed photo.
function Hero() {
  return (
    <Carousel
      label="Store highlights"
      slides={SLIDES.map((slide, index) => (
        <div key={slide.title} className="relative flex h-[640px] items-center justify-center">
          <img
            src={img(slide.image, 1600, 720)}
            srcSet={`${img(slide.image, 800, 1000)} 800w, ${img(slide.image, 1600, 720)} 1600w`}
            sizes="100vw"
            alt=""
            fetchPriority={index === 0 ? 'high' : 'low'}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative flex max-w-[699px] flex-col items-center gap-6 px-10 py-10 text-center">
            <h2 className="text-h2 text-white lg:text-h1">{slide.title}</h2>
            <p className="max-w-[536px] text-h4 text-white">{slide.text}</p>
            <ButtonLink to="/shop" size="lg">
              Start Now
            </ButtonLink>
          </div>
        </div>
      ))}
    />
  )
}

const BANNERS = [
  { label: 'Finishing Touches', title: ['Everyday', 'Extras'], slug: 'accessories', strong: false },
  { label: 'New Season', title: ['Fresh', 'Footwear'], slug: 'shoes', strong: true },
  { label: 'Small Sizes', title: ['Ready', 'To Play'], slug: 'kids', strong: true },
]

// The kit's "desktop-shop-cards-7": three bordered banners.
function Banners({ categories }: { categories: Category[] | undefined }) {
  return (
    <section className="bg-gray-1">
      <div className="mx-auto grid max-w-[1132px] gap-2.5 px-10 py-20 md:grid-cols-3 md:px-6">
        {BANNERS.map((banner, index) => {
          const category = categories?.find((item) => item.slug === banner.slug)
          return (
            <Link
              key={index}
              to={`/shop/${banner.slug}`}
              className="group relative flex h-[232px] flex-col justify-center gap-4 overflow-hidden border border-gray-2 bg-white pl-[27px] md:pl-10"
            >
              {category && (
                <img
                  src={img(category.image, 440, 464)}
                  srcSet={imgSet(category.image, 440, 464)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-y-0 right-0 h-full w-[55%] object-cover transition-transform duration-500 [mask-image:linear-gradient(to_right,transparent,black_45%)] group-hover:scale-105"
                />
              )}
              <span className={cx('relative text-body', banner.strong ? 'text-h6' : 'text-p')}>{banner.label}</span>
              <span className="relative text-h3 text-ink">
                {banner.title[0]}
                <br />
                {banner.title[1]}
              </span>
              <span className="relative text-small text-ink group-hover:text-primary">Explore Items</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

interface ShowcaseProps {
  categories: Category[] | undefined
  lead: string
  tabs: string[]
  reverse?: boolean
}

// The kit's "desktop-product-cards-25": tall category card next to a tabbed,
// paged grid of six products.
function Showcase({ categories, lead, tabs, reverse }: ShowcaseProps) {
  const [tab, setTab] = useState(tabs[0])
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useProducts({ category: tab, sort: 'popularity', limit: 6, page })
  const leadCategory = categories?.find((item) => item.slug === lead)

  const arrow =
    'flex size-[49px] items-center justify-center rounded-full border border-muted text-muted transition-colors enabled:border-body enabled:text-body enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-60'

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1125px] gap-[30px] px-10 py-12 md:px-6 lg:grid-cols-[389fr_658fr]">
        {leadCategory ? (
          <Link
            to={`/shop/${leadCategory.slug}`}
            className={cx(
              'group relative block h-[500px] overflow-hidden border border-disabled lg:h-auto lg:min-h-[796px]',
              reverse && 'lg:order-2',
            )}
          >
            <img
              src={img(leadCategory.image, 600, 1200)}
              srcSet={imgSet(leadCategory.image, 600, 1200)}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/85 to-transparent" aria-hidden />
            <span className="relative flex flex-col gap-[5px] py-6 pr-6 pl-12">
              <span className="text-h6 text-ink uppercase">{leadCategory.name}</span>
              <span className="text-h6 text-body">{plural(leadCategory.productCount, 'Item')}</span>
            </span>
          </Link>
        ) : (
          <Skeleton className={cx('h-[500px] rounded-none lg:h-[796px]', reverse && 'lg:order-2')} />
        )}

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-h5">BESTSELLER PRODUCTS</h2>
            <div className="flex items-center gap-4">
              <div role="tablist" aria-label="Category" className="flex">
                {tabs.map((slug) => {
                  const name = categories?.find((item) => item.slug === slug)?.name ?? slug
                  return (
                    <button
                      key={slug}
                      type="button"
                      role="tab"
                      aria-selected={tab === slug}
                      onClick={() => {
                        setTab(slug)
                        setPage(1)
                      }}
                      className={cx(
                        'rounded-[37px] px-3 py-2.5 text-h6 capitalize transition-colors sm:px-5',
                        tab === slug ? 'text-primary' : 'text-body hover:text-primary',
                      )}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
              <div className="hidden gap-[15px] sm:flex">
                <button
                  type="button"
                  onClick={() => setPage((value) => value - 1)}
                  disabled={!data || data.page <= 1}
                  aria-label="Previous products"
                  className={arrow}
                >
                  <BsChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={!data || data.page >= data.pages}
                  aria-label="Next products"
                  className={arrow}
                >
                  <BsChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <hr className="border-t-2 border-gray-2" />
          <ProductGrid
            products={data?.items}
            loading={loading}
            error={error}
            onRetry={reload}
            variant="mini"
            placeholders={6}
            className="gap-y-[15px] pt-6 lg:!grid-cols-3"
          />
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { title: 'Pick your size', text: 'Choose the colour and size that suit you' },
  { title: 'Add to cart', text: 'Your cart is saved, even if you leave' },
  { title: 'Choose delivery', text: 'Standard, or express in 1 to 2 days' },
  { title: 'Follow your order', text: 'See its status in your account at any time' },
]

// The kit's "desktop-product-cards-4": photo, most popular product, four steps.
function MostPopular({ skip, image, reverse }: { skip: number; image: string; reverse?: boolean }) {
  const { data } = useProducts({ sort: 'popularity', limit: skip + 1 })
  const product = data?.items[skip]

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1117px] flex-col gap-[30px] px-10 py-12 md:px-6">
        <div className="grid lg:grid-cols-[674fr_401fr]">
          <img
            src={img(image, 900, 870)}
            srcSet={imgSet(image, 900, 870)}
            alt=""
            loading="lazy"
            className={cx('h-[400px] w-full object-cover lg:h-[649px]', reverse && 'lg:order-2')}
          />
          <div className="flex flex-col items-center justify-center gap-[19px] bg-gray-1 px-6 py-20 text-center">
            <h2 className="text-h3">MOST POPULAR</h2>
            <p className="max-w-[280px] text-p">
              The piece that leaves our shelves faster than anything else. See what everyone is wearing.
            </p>
            {product ? (
              <>
                <Link to={`/product/${product.slug}`} className="block h-[226px] w-full max-w-[348px] overflow-hidden">
                  <img
                    src={img(product.images[0] ?? '', 700, 460)}
                    srcSet={imgSet(product.images[0] ?? '', 700, 460)}
                    alt={product.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
                <Link to={`/product/${product.slug}`} className="text-h6 text-ink hover:text-primary">
                  {product.name}
                </Link>
                <Prices product={product} />
              </>
            ) : (
              <Skeleton className="h-[226px] w-full max-w-[348px]" />
            )}
          </div>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-5 p-[25px]">
              <span className="text-h2 text-danger" aria-hidden>
                {index + 1}.
              </span>
              <div className="flex flex-col gap-[5px]">
                <h3 className="text-h6">{step.title}</h3>
                <p className="text-small">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// The kit's "desktop-product-cards-15": left aligned title, rule, four cards.
function BestsellerRow() {
  const { data, loading, error, reload } = useProducts({ bestseller: true, sort: 'rating', limit: 4 })
  return (
    <section className="bg-gray-1">
      <div className="container-x flex flex-col gap-6 py-12">
        <h2 className="text-h3">BESTSELLER PRODUCTS</h2>
        <hr className="border-t-2 border-gray-2" />
        <ProductGrid
          products={data?.items}
          loading={loading}
          error={error}
          onRetry={reload}
          variant="compact"
          placeholders={4}
        />
      </div>
    </section>
  )
}

export default function Home3() {
  const categories = useCategories()

  return (
    <>
      <title>{`${site.name} | Style delivered`}</title>
      <Hero />
      <Banners categories={categories.data} />
      <Showcase categories={categories.data} lead="women" tabs={['men', 'women', 'accessories']} />
      <MostPopular skip={0} image={photo('1519710164239-da123dc03ef4')} />
      <Showcase categories={categories.data} lead="men" tabs={['shoes', 'kids', 'accessories']} reverse />
      <MostPopular skip={1} image={photo('1489987707025-afc232f7ea0f')} reverse />
      <BestsellerRow />
      <PromiseStrip />
      <FeaturedPosts />
    </>
  )
}
