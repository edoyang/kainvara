import { useEffect, useRef, useState } from 'react'
import { BsChevronLeft, BsChevronRight, BsX } from 'react-icons/bs'
import { cx, img, imgSet } from '../../lib/format.ts'

interface GalleryProps {
  images: string[]
  name: string
  // Lets the page open the zoom view from its own "quick look" button.
  zoomOpen: boolean
  onZoomChange: (open: boolean) => void
}

// The kit's product carousel: 506x450 cover, arrows, 100x75 thumbnails.
export function Gallery({ images, name, zoomOpen, onZoomChange }: GalleryProps) {
  const [index, setIndex] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const count = images.length
  const current = images[Math.min(index, count - 1)] ?? ''

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (zoomOpen && !dialog.open) dialog.showModal()
    if (!zoomOpen && dialog.open) dialog.close()
  }, [zoomOpen])

  const go = (step: number) => setIndex((value) => (Math.min(value, count - 1) + step + count) % count)
  const arrow =
    'absolute top-1/2 flex h-11 w-10 -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.5)] transition-transform hover:scale-110'

  return (
    <div className="flex flex-col gap-[21px]">
      <div className="relative h-[300px] overflow-hidden rounded-[5px] bg-gray-2 sm:h-[450px]">
        <button
          type="button"
          onClick={() => onZoomChange(true)}
          className="block size-full cursor-zoom-in"
          aria-label={`Zoom photo ${Math.min(index, count - 1) + 1} of ${name}`}
        >
          <img
            key={current}
            src={img(current, 760, 680)}
            srcSet={imgSet(current, 760, 680)}
            alt={`${name}, photo ${Math.min(index, count - 1) + 1} of ${count}`}
            fetchPriority="high"
            className="size-full animate-fade-in object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={cx(arrow, 'left-10')}>
              <BsChevronLeft size={40} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={cx(arrow, 'right-10')}>
              <BsChevronRight size={40} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="flex flex-wrap gap-[19px]">
          {images.map((image, imageIndex) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show photo ${imageIndex + 1}`}
                aria-current={imageIndex === index}
                className={cx(
                  'block h-[75px] w-[100px] overflow-hidden transition-opacity',
                  imageIndex === index ? 'opacity-100' : 'opacity-50 hover:opacity-80',
                )}
              >
                <img src={img(image, 200, 150)} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => onZoomChange(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) onZoomChange(false)
        }}
        aria-label={`${name} photo`}
        className="m-auto max-h-[92vh] max-w-[92vw] overflow-visible bg-transparent p-0 backdrop:bg-dark/85"
      >
        {zoomOpen && (
          <div className="relative">
            <img
              src={img(current, 1400)}
              alt={name}
              className="max-h-[92vh] max-w-[92vw] rounded-[5px] object-contain"
            />
            <button
              type="button"
              onClick={() => onZoomChange(false)}
              aria-label="Close photo"
              className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white text-2xl text-ink shadow-light hover:bg-primary hover:text-white"
            >
              <BsX />
            </button>
          </div>
        )}
      </dialog>
    </div>
  )
}
