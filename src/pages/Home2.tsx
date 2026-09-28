import { useState } from 'react'
import { BsArrowCounterclockwise, BsShieldLock, BsTruck } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { PromiseStrip } from '../components/layout/StorePromises.tsx'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { Seo } from '../components/Seo.tsx'
import { ProductListItem } from '../components/shop/ProductListItem.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { SectionHeading } from '../components/ui/SectionHeading.tsx'
import { useProducts } from '../hooks/useCatalog.ts'
import { cx, img, imgSet, seasonLabel } from '../lib/format.ts'
import { media, site } from '../lib/site.ts'

// The kit's rounded gradient hero from "ecommerce-desktop-2".
function Hero() {
  return (
    <section className="bg-white px-0 pb-[52px] md:px-[59px] md:pt-[42px]">
      <div className="mx-auto grid max-w-[1292px] items-center overflow-hidden bg-gradient-to-r from-[#96e9fb] to-[#abecd6] md:rounded-[20px] lg:grid-cols-2">
        <div className="flex flex-col items-center gap-[30px] px-10 pt-20 text-center lg:items-start lg:py-[152px] lg:pr-0 lg:pl-[127px] lg:text-left">
          <p className="text-h5 text-primary-hover">{seasonLabel()}</p>
          <h1 className="text-h2 lg:text-h1">NEW COLLECTION</h1>
          <p className="max-w-[376px] text-h4 text-body">
            Fresh pieces for the season, made to be worn on repeat.
          </p>
          <ButtonLink to="/shop" size="lg">
            SHOP NOW
          </ButtonLink>
        </div>

        <div className="relative mx-auto mt-10 aspect-square w-[86%] max-w-[500px] lg:mt-0 lg:mr-[69px] lg:ml-auto">
          <span className="absolute inset-0 rounded-full bg-white" aria-hidden />
          <span className="absolute top-[2%] -left-[12%] size-[16%] rounded-full bg-white" aria-hidden />
          <span className="absolute top-[51%] -right-[9%] size-[6%] rounded-full bg-white" aria-hidden />
          <span className="absolute top-[25%] -right-[10%] size-[3%] rounded-full bg-violet" aria-hidden />
          <span className="absolute top-[84%] -left-[7%] size-[3%] rounded-full bg-violet" aria-hidden />
          <img
            src={img(media.heroSlides[1], 700, 700)}
            srcSet={imgSet(media.heroSlides[1], 700, 700)}
            alt="Model wearing sunglasses from the new collection"
            fetchPriority="high"
            className="absolute inset-[4%] size-[92%] rounded-full object-cover object-top"
          />
        </div>
      </div>
    </section>
  )
}

interface PromoProps {
  image: string
  title: string
  to: string
  className: string
  large?: boolean
}

function Promo({ image, title, to, className, large }: PromoProps) {
  return (
    <div className={cx('group relative overflow-hidden bg-gray-2', className)}>
      <img
        src={img(image, 900, 840)}
        srcSet={imgSet(image, 900, 840)}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className={cx(
          'absolute bottom-0 left-0 flex flex-col items-start justify-center gap-5 bg-[#2d8bc0]/75 px-[36px]',
          large ? 'h-[238px] w-[420px] max-w-full px-10 md:px-[66px]' : 'h-[173px] w-[347px] max-w-full',
        )}
      >
        <h3 className={cx('max-w-[260px] text-white', large ? 'text-h3' : 'text-h4')}>{title}</h3>
        <ButtonLink to={to} variant="outline-light" className="border-white text-white">
          EXPLORE ITEMS
        </ButtonLink>
      </div>
    </div>
  )
}

// The kit's "desktop-shop-cards-23".
function WeekPromos() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1233px] gap-[15px] px-10 py-20 md:px-6 lg:grid-cols-[612fr_558fr]">
        <Promo image={media.weekTop} title="Top Product Of the Week" to="/shop?sort=popularity" className="h-[572px]" large />
        <div className="flex flex-col gap-[22px]">
          <Promo image={media.weekSide[0]} title="New Arrivals This Week" to="/shop?sort=newest" className="h-[289px]" />
          <Promo image={media.weekSide[1]} title="Save On Seasonal Picks" to="/shop?sale=1" className="h-[261px]" />
        </div>
      </div>
    </section>
  )
}

// The kit's "desktop-product-cards-21": five columns and a load more button.
function Bestsellers() {
  const [limit, setLimit] = useState(10)
  const { data, loading, error, reload } = useProducts({ sort: 'popularity', limit })
  const hasMore = data ? data.total > data.items.length && limit < 40 : false

  return (
    <section className="bg-white">
      <div className="container-x flex flex-col items-center gap-6 py-20">
        <SectionHeading
          eyebrow="Featured Products"
          title="BESTSELLER PRODUCTS"
          text="The pieces our customers come back for"
        />
        <ProductGrid
          products={data?.items}
          loading={loading}
          error={error}
          onRetry={reload}
          variant="mini"
          columns={5}
          placeholders={10}
          className="w-full gap-y-[15px] pt-8"
        />
        {hasMore && (
          <Button variant="outline-primary" loading={loading} onClick={() => setLimit((value) => value + 10)}>
            LOAD MORE PRODUCTS
          </Button>
        )}
      </div>
    </section>
  )
}

// The kit's "desktop-content-7".
function LoveWhatWeDo() {
  return (
    <section className="bg-white">
      <div className="container-x grid items-center gap-[60px] py-20 lg:grid-cols-[513fr_447fr] lg:gap-[90px]">
        <div className="grid h-[498px] grid-cols-[217fr_280fr] gap-4">
          {media.loveWhatWeDo.map((image) => (
            <img
              key={image}
              src={img(image, 420, 750)}
              srcSet={imgSet(image, 420, 750)}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <p className="text-h5 text-primary">Our Approach</p>
          <h2 className="text-h2">We love what we do</h2>
          <p className="max-w-[351px] text-p">
            Every piece in the store is picked for how it wears, washes and lasts, not for how it looks on a
            hanger for one season.
          </p>
          <p className="max-w-[351px] text-p">
            We keep the range small on purpose. It means we know each product well, and you spend less time
            scrolling and more time wearing.
          </p>
        </div>
      </div>
    </section>
  )
}

const SERVICES = [
  { Icon: BsTruck, title: 'Fast Delivery', text: 'Free standard delivery over $50, or express in 1 to 2 business days.' },
  {
    Icon: BsArrowCounterclockwise,
    title: 'Easy Returns',
    text: 'Changed your mind? Send it back within 30 days for a full refund.',
  },
  { Icon: BsShieldLock, title: 'Safe Checkout', text: 'Your details travel over an encrypted connection, every time.' },
]

// The kit's "desktop-features-12".
function Services() {
  return (
    <section className="bg-white">
      <div className="container-x flex flex-col gap-20 py-20">
        <SectionHeading
          eyebrow={`Why ${site.name}`}
          title="THE BEST SERVICES"
          text="Three things we never compromise on"
        />
        <ul className="grid gap-[30px] md:grid-cols-3">
          {SERVICES.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center gap-5 px-10 py-[35px] text-center">
              <Icon size={72} className="text-primary" aria-hidden />
              <h3 className="text-h3">{title}</h3>
              <p className="max-w-[232px] text-p">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// The kit's "desktop-blog-2": two wide cards.
function FeaturedPicks() {
  const { data } = useProducts({ featured: true, sort: 'popularity', limit: 2 })
  if (!data?.items.length) return null

  return (
    <section className="bg-white">
      <div className="container-x flex flex-col gap-20 py-20 lg:gap-24">
        <SectionHeading eyebrow="Hand Picked" eyebrowTone="primary" title="Featured Picks" size="h2" />
        <ul className="grid gap-[30px] lg:grid-cols-2">
          {data.items.map((product) => (
            <li key={product.id}>
              <ProductListItem product={product} />
            </li>
          ))}
        </ul>
        <p className="text-center text-h6">
          <Link to="/shop" className="text-primary hover:text-primary-hover">
            See the full collection
          </Link>
        </p>
      </div>
    </section>
  )
}

export default function Home2() {
  return (
    <>
      <Seo title="New collection" noindex />
      <Hero />
      <PromiseStrip />
      <WeekPromos />
      <Bestsellers />
      <LoveWhatWeDo />
      <Services />
      <FeaturedPicks />
    </>
  )
}
