import { Link } from 'react-router-dom'
import { cx } from '../../lib/format.ts'
import { site } from '../../lib/site.ts'

// The logo mark next to the store name, linking home.
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cx('flex items-center gap-2.5 py-[13px] text-h3 text-ink', className)}
      aria-label={`${site.name} home`}
    >
      <img src={site.logo} alt="" width={32} height={32} className="size-8 shrink-0" />
      {site.name}
    </Link>
  )
}
