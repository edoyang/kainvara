import { BsEnvelope, BsTelephone } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'
import { site } from '../../lib/site.ts'
import { SocialLinks } from './SocialLinks.tsx'

// Dark on the home pages, green on the shop and product pages.
export function TopBar({ tone }: { tone: 'dark' | 'green' }) {
  return (
    <div className={cx('hidden text-white lg:block', tone === 'dark' ? 'bg-dark' : 'bg-secondary')}>
      <div className="flex min-h-[58px] items-center justify-between gap-[30px] px-6 text-h6">
        <div className="flex items-center gap-2.5">
          <a href={site.phoneHref} className="flex items-center gap-[5px] rounded-[5px] p-2.5 hover:bg-white/10">
            <BsTelephone size={16} aria-hidden />
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-[5px] rounded-[5px] p-2.5 hover:bg-white/10">
            <BsEnvelope size={16} aria-hidden />
            {site.email}
          </a>
        </div>
        <p className="hidden p-2.5 text-white xl:block">{site.promo}</p>
        <div className="flex items-center gap-2.5 p-2.5">
          <span>Follow Us :</span>
          <SocialLinks
            size={16}
            className="gap-1.5"
            itemClassName="flex size-[26px] items-center justify-center rounded hover:bg-white/10"
          />
        </div>
      </div>
    </div>
  )
}
