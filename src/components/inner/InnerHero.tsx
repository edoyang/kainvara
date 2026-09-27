import type { ReactNode } from 'react'
import { img, imgSet } from '../../lib/format.ts'

interface InnerHeroProps {
  eyebrow: string
  title: ReactNode
  text: string
  image: string
  imageAlt: string
  children?: ReactNode
}

// The kit's "desktop-header-24": copy on the left, photo over a blush circle
// with small floating dots on the right.
export function InnerHero({ eyebrow, title, text, image, imageAlt, children }: InnerHeroProps) {
  return (
    <section className="overflow-hidden bg-white">
      <div className="container-x grid items-center gap-[30px] py-20 lg:grid-cols-[599fr_415fr] lg:py-[112px]">
        <div className="flex flex-col items-center gap-[35px] text-center lg:items-start lg:text-left">
          <p className="text-h5 text-ink uppercase">{eyebrow}</p>
          <h1 className="text-h2 lg:text-h1">{title}</h1>
          <p className="max-w-[376px] text-h4 text-body">{text}</p>
          {children}
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[387px] lg:max-w-[484px] lg:justify-self-end">
          <span className="absolute inset-0 rounded-full bg-blush" aria-hidden />
          <span className="absolute top-[2%] -left-[12%] size-[16%] rounded-full bg-blush" aria-hidden />
          <span className="absolute top-[51%] -right-[9%] size-[6%] rounded-full bg-blush" aria-hidden />
          <span className="absolute top-[25%] -right-[10%] size-[3%] rounded-full bg-violet" aria-hidden />
          <span className="absolute top-[84%] -left-[7%] size-[3%] rounded-full bg-violet" aria-hidden />
          <img
            src={img(image, 640, 640)}
            srcSet={imgSet(image, 640, 640)}
            alt={imageAlt}
            fetchPriority="high"
            className="absolute inset-[4%] size-[92%] rounded-full object-cover object-top"
          />
        </div>
      </div>
    </section>
  )
}
