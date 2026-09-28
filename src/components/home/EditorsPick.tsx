import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCatalog.ts'
import { cx, img, imgSet } from '../../lib/format.ts'
import type { Category } from '../../types.ts'
import { SectionHeading } from '../ui/SectionHeading.tsx'
import { Skeleton } from '../ui/States.tsx'

interface TileProps {
  category: Category | undefined
  width: number
  height: number
  className?: string
  labelClassName?: string
}

function Tile({ category, width, height, className, labelClassName }: TileProps) {
  if (!category) return <Skeleton className={cx('rounded-none', className)} />
  return (
    <Link to={`/shop/${category.slug}`} className={cx('group relative block overflow-hidden bg-gray-2', className)}>
      <img
        src={img(category.image, width, height)}
        srcSet={imgSet(category.image, width, height)}
        alt={`${category.name} collection`}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-[#212121]/25 transition-colors group-hover:bg-[#212121]/10" />
      <span
        className={cx(
          'absolute bottom-[26px] left-[31px] flex h-12 min-w-[120px] items-center justify-center bg-white px-6 text-h5 text-ink uppercase',
          labelClassName,
        )}
      >
        {category.name}
      </span>
    </Link>
  )
}

// The kit's "desktop-shop-cards-31": one large tile, one tall tile, two stacked.
export function EditorsPick() {
  const { data } = useCategories()
  const find = (slug: string) => data?.find((category) => category.slug === slug)

  return (
    <section className="bg-gray-1 py-20">
      <div className="container-x flex flex-col gap-12">
        <SectionHeading title="EDITOR'S PICK" text="Four departments, one easy place to start" />
        <div className="grid gap-[30px] md:grid-cols-[510fr_240fr_240fr]">
          <Tile category={find('men')} width={700} height={690} className="h-[500px]" labelClassName="w-[170px]" />
          <Tile category={find('women')} width={480} height={1000} className="h-[500px]" labelClassName="left-5 w-[136px]" />
          <div className="flex flex-col gap-4">
            <Tile
              category={find('accessories')}
              width={480}
              height={484}
              className="h-[242px]"
              labelClassName="left-3.5 w-[170px]"
            />
            <Tile category={find('kids')} width={480} height={484} className="h-[242px]" labelClassName="left-[18px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
