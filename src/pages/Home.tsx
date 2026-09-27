import { EditorsPick } from '../components/home/EditorsPick.tsx'
import { FeaturedPosts } from '../components/home/FeaturedPosts.tsx'
import { HeroCarousel } from '../components/home/HeroCarousel.tsx'
import { ProductSpotlight } from '../components/home/ProductSpotlight.tsx'
import { ProductGrid } from '../components/product/ProductGrid.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { SectionHeading } from '../components/ui/SectionHeading.tsx'
import { useProducts } from '../hooks/useCatalog.ts'
import { img, imgSet, seasonLabel } from '../lib/format.ts'
import { media, pageTitle } from '../lib/site.ts'

function Bestsellers() {
  const { data, loading, error, reload } = useProducts({ bestseller: true, sort: 'popularity', limit: 8 })

  return (
    <section className="bg-white py-20">
      <div className="container-x flex flex-col gap-20">
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
          variant="tall"
          className="gap-y-20"
        />
      </div>
    </section>
  )
}

// The kit's "container-fluid" block: photo on the left, copy and two buttons.
function Universe() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-[30px] lg:grid-cols-[704fr_573fr] lg:pl-[132px]">
        <div className="order-2 h-[420px] overflow-hidden lg:order-1 lg:h-[682px]">
          <img
            src={img(media.universe, 760, 740)}
            srcSet={imgSet(media.universe, 760, 740)}
            alt="Model wearing pieces from the new season collection"
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top"
          />
        </div>
        <div className="order-1 flex flex-col items-center gap-[30px] px-10 pt-20 text-center lg:order-2 lg:items-start lg:px-0 lg:pt-0 lg:text-left">
          <p className="text-h5 text-muted">{seasonLabel()}</p>
          <h2 className="max-w-[375px] text-h2">Made for Every Day</h2>
          <p className="max-w-[376px] text-h4 text-body">
            Easy layers, honest fabrics and colours that work together.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <ButtonLink to="/shop" variant="success">
              BUY NOW
            </ButtonLink>
            <ButtonLink to="/about" variant="outline-success">
              READ MORE
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <title>{pageTitle()}</title>
      <HeroCarousel />
      <EditorsPick />
      <Bestsellers />
      <ProductSpotlight />
      <Universe />
      <FeaturedPosts />
    </>
  )
}
