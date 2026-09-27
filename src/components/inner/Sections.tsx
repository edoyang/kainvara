import { useRef, useState } from 'react'
import { BsPlayFill } from 'react-icons/bs'
import { useCategories } from '../../hooks/useCatalog.ts'
import { cx, img, imgSet } from '../../lib/format.ts'
import { media, site, team } from '../../lib/site.ts'
import { SocialLinks } from '../layout/SocialLinks.tsx'
import { PromiseRow } from '../layout/StorePromises.tsx'
import { ButtonLink } from '../ui/Button.tsx'
import { SectionHeading } from '../ui/SectionHeading.tsx'

// The kit's "desktop-stats-9", showing real numbers from the catalog.
export function Stats() {
  const { data } = useCategories()
  const loading = ' '
  const stats = [
    {
      value: data ? String(data.reduce((sum, category) => sum + category.productCount, 0)) : loading,
      label: 'Products In Store',
    },
    { value: data ? String(data.length) : loading, label: 'Departments' },
    { value: '30', label: 'Day Returns' },
    { value: '2', label: 'Delivery Options' },
  ]

  return (
    <section className="bg-white">
      <div className="container-x py-20">
        <dl className="grid gap-[100px] sm:grid-cols-2 sm:gap-[30px] lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center text-center">
              <dt className="text-h5 text-body">{stat.label}</dt>
              <dd className="text-h1 text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// The kit's "Video card": poster with a gradient and a round play button.
export function VideoSection() {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function play() {
    setPlaying(true)
    // The element is rendered by the state change above, so play on the next frame.
    requestAnimationFrame(() => void videoRef.current?.play().catch(() => undefined))
  }

  return (
    <section className="bg-white">
      <div className="container-x py-20 lg:py-[112px]">
        <div className="relative mx-auto aspect-[989/540] max-w-[989px] overflow-hidden rounded-[20px] bg-dark">
          {playing ? (
            <video
              ref={videoRef}
              src={media.video}
              poster={img(media.videoPoster, 1200, 656)}
              controls
              playsInline
              className="size-full object-cover"
            >
              Your browser cannot play this video.
            </video>
          ) : (
            <>
              <img
                src={img(media.videoPoster, 1200, 656)}
                srcSet={imgSet(media.videoPoster, 1200, 656)}
                alt="Mountains reflected in a still lake"
                loading="lazy"
                className="size-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-b from-black/0 to-[#383838]/40" aria-hidden />
              <button
                type="button"
                onClick={play}
                aria-label="Play our story video"
                className="absolute top-1/2 left-1/2 flex size-14 -translate-1/2 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-110 sm:size-[93px]"
              >
                <BsPlayFill className="ml-1 size-7 sm:size-10" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

interface TeamGridProps {
  count: number
  title?: string
  text?: string
}

// The kit's "desktop-team-4".
export function TeamGrid({ count, title = 'Meet Our Team', text }: TeamGridProps) {
  return (
    <section className="bg-white">
      <div className="container-x flex flex-col gap-[112px] py-20 lg:py-[112px]">
        <SectionHeading title={title} size="h2" text={text} />
        <ul className="grid gap-x-[30px] gap-y-[112px] sm:grid-cols-2 lg:grid-cols-3">
          {team.slice(0, count).map((member) => (
            <li key={member.name} className="flex flex-col bg-white">
              <img
                src={img(member.image, 480, 350)}
                srcSet={imgSet(member.image, 480, 350)}
                alt={`Portrait of ${member.name}`}
                loading="lazy"
                decoding="async"
                className="h-[231px] w-full object-cover object-top"
              />
              <div className="flex flex-col items-center gap-2.5 p-[30px] text-center">
                <h3 className="text-h5">{member.name}</h3>
                <p className="text-h6 text-body">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// The layout of the kit's "desktop-clients-3", with the store's own promises
// in place of company logos.
export function WhatYouGet() {
  return (
    <section className="bg-gray-1">
      <div className="container-x flex flex-col gap-6 py-20">
        <SectionHeading
          title="Shopping Made Simple"
          size="h2"
          className="max-w-[864px] gap-[30px]"
          text="The same clear terms on every order, whether it is one tee or a whole new wardrobe."
        />
        <PromiseRow />
      </div>
    </section>
  )
}

// The kit's "desktop-testimonials-4": blue panel with a photo on the right.
export function WorkWithUs() {
  return (
    <section className="relative bg-primary-hover">
      <img
        src={img(media.workWithUs, 700, 760)}
        srcSet={imgSet(media.workWithUs, 700, 760)}
        alt="Team member wearing the new collection"
        loading="lazy"
        className="absolute inset-y-0 right-0 hidden h-full w-[41%] object-cover object-top lg:block"
      />
      <div className="container-x relative flex items-center py-20 lg:min-h-[636px] lg:py-[112px]">
        <div className="mx-auto flex max-w-[438px] flex-col items-center gap-6 text-center lg:mx-0 lg:items-start lg:text-left">
          <p className="text-h5 text-white">WORK WITH ME</p>
          <h2 className="text-h2 text-white">Let's Build Something</h2>
          <p className="text-p text-white">
            This store was designed and built by {site.owner.name}, a software engineer in Sydney. If you like
            how it works, I would be glad to hear about your project or your team.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 lg:justify-start">
            <ButtonLink to="/contact" variant="outline-light">
              Get in touch
            </ButtonLink>
            <a
              href={site.owner.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-[5px] bg-white px-10 py-[15px] text-btn text-primary-hover transition-colors hover:bg-gray-1"
            >
              View portfolio
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SocialLogos({ className }: { className?: string }) {
  return <SocialLinks size={30} colored className={cx('gap-[34px] p-2.5', className)} />
}

// The kit's "desktop-cta-3": headline, short text, button and social links.
export function TrialCta({ spacious }: { spacious?: boolean }) {
  return (
    <section className="bg-white">
      <div className={`container-x flex flex-col items-center gap-[30px] text-center ${spacious ? 'py-20 lg:py-40' : 'py-20'}`}>
        <h2 className="max-w-[547px] text-h2">Create your free account</h2>
        <p className="max-w-[411px] text-p">
          Save your address, keep a wishlist on every device and follow each order from checkout to your door.
        </p>
        <ButtonLink to="/register">Join for free</ButtonLink>
        <SocialLogos />
      </div>
    </section>
  )
}
