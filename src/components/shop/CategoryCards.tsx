import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCatalog.ts'
import { cx, img, imgSet, plural } from '../../lib/format.ts'
import { Skeleton } from '../ui/States.tsx'

// The kit's "desktop-shop-cards-18": five photo tiles with a centred label.
export function CategoryCards({ active }: { active?: string }) {
  const { data } = useCategories()

  return (
    <section className="bg-gray-1 pb-12" aria-label="Shop by category">
      <div className="container-x">
        <ul className="grid grid-cols-1 gap-[15px] xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {(data ?? Array.from({ length: 5 }, () => null)).slice(0, 5).map((category, index) =>
            category ? (
              <li key={category.id}>
                <Link
                  to={active === category.slug ? '/shop' : `/shop/${category.slug}`}
                  aria-current={active === category.slug ? 'true' : undefined}
                  className={cx(
                    'group relative flex h-[300px] flex-col items-center justify-center gap-2.5 overflow-hidden bg-gray-2 text-white lg:h-[223px]',
                    active === category.slug && 'ring-2 ring-primary ring-offset-2 ring-offset-gray-1',
                  )}
                >
                  <img
                    src={img(category.image, 420, 460)}
                    srcSet={imgSet(category.image, 420, 460)}
                    alt={`${category.name} collection`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-[#212121]/25 transition-colors group-hover:bg-[#212121]/45" />
                  <span className="relative text-h5 uppercase">{category.name}</span>
                  <span className="relative text-p">{plural(category.productCount, 'Item')}</span>
                </Link>
              </li>
            ) : (
              <li key={index}>
                <Skeleton className="h-[300px] rounded-none lg:h-[223px]" />
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}
