import { Fragment } from 'react'
import { BsChevronRight } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format.ts'

export interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: Crumb[]
  className?: string
  // The current page is muted (#BDBDBD) on shop pages and grey (#737373) on inner pages.
  currentClassName?: string
}

export function Breadcrumb({ items, className, currentClassName = 'text-muted' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-[15px] py-2.5 text-h6">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <li aria-hidden className="text-muted">
                <BsChevronRight size={14} />
              </li>
            )}
            <li>
              {item.to ? (
                <Link to={item.to} className="text-ink hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className={cx(currentClassName)}>
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
