import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'

interface CarouselProps {
  label: string
  slides: ReactNode[]
  className?: string
  // Time between slides. Auto play stops while the carousel is hovered or
  // focused, and is off for visitors who prefer reduced motion.
  autoPlayMs?: number
}

export function Carousel({ label, slides, className, autoPlayMs = 7000 }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const current = count ? index % count : 0

  const go = useCallback(
    (step: number) => setIndex((value) => (((value + step) % count) + count) % count),
    [count],
  )

  useEffect(() => {
    if (paused || count < 2 || !autoPlayMs) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => go(1), autoPlayMs)
    return () => window.clearInterval(timer)
  }, [paused, count, autoPlayMs, go])

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') go(-1)
    if (event.key === 'ArrowRight') go(1)
  }

  const arrow =
    'absolute top-1/2 z-20 flex h-11 w-10 -translate-y-1/2 items-center justify-center text-white drop-shadow transition-transform hover:scale-110'

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cx('relative overflow-hidden', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slideIndex}
          role="group"
          aria-roledescription="slide"
          aria-label={`${slideIndex + 1} of ${count}`}
          aria-hidden={slideIndex !== current}
          inert={slideIndex !== current}
          className={cx(
            'transition-opacity duration-700 ease-out',
            slideIndex === 0 ? 'relative' : 'absolute inset-0',
            slideIndex === current ? 'z-10 opacity-100' : 'z-0 opacity-0',
          )}
        >
          {slide}
        </div>
      ))}

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className={cx(arrow, 'left-4 md:left-10')}>
            <BsChevronLeft size={40} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className={cx(arrow, 'right-4 md:right-10')}>
            <BsChevronRight size={40} />
          </button>
          <div className="absolute inset-x-0 bottom-[49px] z-20 flex justify-center">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === current}
                className={cx(
                  'h-2.5 w-[62px] bg-white transition-opacity',
                  slideIndex === current ? 'opacity-100' : 'opacity-50 hover:opacity-80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
