import { cx, img, seasonLabel } from '../../lib/format.ts'
import { media } from '../../lib/site.ts'
import { ButtonLink } from '../ui/Button.tsx'
import { Carousel } from '../ui/Carousel.tsx'

interface Slide {
  image: string
  position: string
  title: string
  text: string
  cta: string
  to: string
}

const SLIDES: Slide[] = [
  {
    image: media.heroSlides[0],
    position: 'object-[70%_20%]',
    title: 'NEW COLLECTION',
    text: 'Fresh pieces for the season, made to be worn on repeat.',
    cta: 'SHOP NOW',
    to: '/shop',
  },
  {
    image: media.heroSlides[1],
    position: 'object-[60%_25%]',
    title: 'BRIGHTER DAYS',
    text: 'Dresses, shades and light layers for the warmest part of the year.',
    cta: 'SHOP WOMEN',
    to: '/shop/women',
  },
]

// The kit's "desktop-shop-header-1" slide: photo, headline on the left, green CTA.
export function HeroCarousel() {
  const eyebrow = seasonLabel()

  return (
    <Carousel
      label="Featured collections"
      slides={SLIDES.map((slide, index) => (
        <div key={slide.title} className="relative flex h-[753px] items-center lg:h-[716px]">
          <img
            src={img(slide.image, 1600, 800)}
            srcSet={`${img(slide.image, 800, 1200)} 800w, ${img(slide.image, 1600, 800)} 1600w, ${img(slide.image, 2400, 1200)} 2400w`}
            sizes="100vw"
            alt=""
            fetchPriority={index === 0 ? 'high' : 'low'}
            loading={index === 0 ? 'eager' : 'lazy'}
            className={cx('absolute inset-0 size-full object-cover', slide.position)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05b0e0]/85 via-[#05b0e0]/45 to-[#05b0e0]/10 max-lg:bg-[#05b0e0]/55 max-lg:bg-none" />

          <div className="relative mx-auto w-full max-w-[1092px] px-10 md:px-6">
            <div className="flex max-w-[599px] flex-col items-center gap-[35px] text-center max-lg:mx-auto lg:items-start lg:text-left">
              <p className="text-h5 text-white">{eyebrow}</p>
              <h2 className="text-h2 text-white lg:text-h1">{slide.title}</h2>
              <p className="max-w-[291px] text-h4 text-gray-1 lg:max-w-[376px]">{slide.text}</p>
              <ButtonLink to={slide.to} variant="success" size="lg">
                {slide.cta}
              </ButtonLink>
            </div>
          </div>
        </div>
      ))}
    />
  )
}
