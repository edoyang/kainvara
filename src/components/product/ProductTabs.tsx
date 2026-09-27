import { useState } from 'react'
import { BsChevronRight } from 'react-icons/bs'
import { cx, img, imgSet } from '../../lib/format.ts'
import type { Product } from '../../types.ts'
import { Reviews } from './Reviews.tsx'

type TabId = 'description' | 'details' | 'reviews'

const DELIVERY = [
  'Free standard delivery on orders over $50',
  'Express delivery in 1 to 2 business days',
  'Free returns within 30 days',
]

function ArrowList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-5 text-h6 text-body">
          <BsChevronRight size={14} className="mt-[5px] shrink-0 text-body" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}

interface ProductTabsProps {
  product: Product
  onReviewChange: () => void
}

// The kit's "desktop-product-description-1": centred tab bar over three columns.
export function ProductTabs({ product, onReviewChange }: ProductTabsProps) {
  const [tab, setTab] = useState<TabId>('description')
  const cover = product.images[1] ?? product.images[0] ?? ''

  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: 'description', label: 'Description' },
    { id: 'details', label: 'Additional Information' },
    { id: 'reviews', label: 'Reviews', count: product.reviewCount },
  ]

  const details: Array<[string, string]> = [
    ['Department', product.department || product.category.name],
    ['Category', product.category.name],
    ['Colours', product.colors.map((color) => color.name).join(', ') || 'One colour'],
    ['Sizes', product.sizes.join(', ') || 'One size'],
    ['Availability', product.stock > 0 ? `${product.stock} in stock` : 'Sold out'],
    ['Product code', `KV-${product.id.slice(-8).toUpperCase()}`],
    ['Tags', product.tags.join(', ')],
  ]

  return (
    <section className="bg-white" id="details">
      <div className="container-x">
        <div
          role="tablist"
          aria-label="Product information"
          className="flex flex-wrap justify-center border-b border-gray-2 pt-2.5"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cx(
                '-mb-px border-b-2 p-4 text-h6 transition-colors sm:p-6',
                tab === item.id ? 'border-primary text-ink' : 'border-transparent text-body hover:text-ink',
              )}
            >
              {item.label}
              {item.count !== undefined && <span className="ml-2 text-secondary">({item.count})</span>}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6 pb-12">
          {tab === 'description' && (
            <div className="grid animate-fade-in gap-[30px] lg:grid-cols-3">
              <div className="relative h-[392px] pr-[9px] pb-[10px]">
                <span className="absolute inset-0 top-0 left-[3px] rounded-[6px] bg-[#c4c4c4]/20" aria-hidden />
                <img
                  src={img(cover, 640, 760)}
                  srcSet={imgSet(cover, 640, 760)}
                  alt={`${product.name} in detail`}
                  loading="lazy"
                  className="relative size-full rounded-[5px] object-cover"
                />
              </div>
              <div className="flex flex-col gap-[30px] pb-[25px]">
                <h3 className="text-h3">About this piece</h3>
                <div className="flex flex-col gap-5 text-p">
                  {product.description
                    .split(/(?<=\.)\s+(?=[A-Z])/)
                    .reduce<string[]>((paragraphs, sentence, index) => {
                      // Two sentences per paragraph keeps the column easy to read.
                      if (index % 2 === 0) paragraphs.push(sentence)
                      else paragraphs[paragraphs.length - 1] += ` ${sentence}`
                      return paragraphs
                    }, [])
                    .map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-[25px]">
                <div className="flex flex-col gap-[30px]">
                  <h3 className="text-h3">Highlights</h3>
                  <ArrowList items={product.highlights} />
                </div>
                <div className="flex flex-col gap-[30px]">
                  <h3 className="text-h3">Delivery and returns</h3>
                  <ArrowList items={DELIVERY} />
                </div>
              </div>
            </div>
          )}

          {tab === 'details' && (
            <dl className="mx-auto max-w-[692px] animate-fade-in divide-y divide-gray-2">
              {details.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[140px_1fr] gap-4 py-4 sm:grid-cols-[220px_1fr]">
                  <dt className="text-h6 text-ink">{label}</dt>
                  <dd className="text-p">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === 'reviews' && (
            <div className="animate-fade-in">
              <Reviews product={product} onChange={onReviewChange} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
