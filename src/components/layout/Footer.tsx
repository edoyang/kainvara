import { BiMap, BiPhone } from 'react-icons/bi'
import { BsSend } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format.ts'
import { site } from '../../lib/site.ts'
import { ButtonLink } from '../ui/Button.tsx'
import { Brand } from './Brand.tsx'
import { SocialLinks } from './SocialLinks.tsx'
import { SubscribeForm } from './SubscribeForm.tsx'

const COLUMNS = [
  {
    title: 'Company Info',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Team', to: '/team' },
      { label: 'Contact', to: '/contact' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', to: '/policies#terms' },
      { label: 'Privacy Policy', to: '/policies#privacy' },
      { label: 'Returns', to: '/policies#returns' },
      { label: 'Shipping', to: '/policies#shipping' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'Bestsellers', to: '/shop?sort=popularity' },
      { label: 'On Sale', to: '/shop?sale=1' },
      { label: 'Top Rated', to: '/shop?sort=rating' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Membership Pricing', to: '/pricing' },
      { label: 'My Account', to: '/account' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Contact Support', to: '/contact' },
    ],
  },
]

// tone "light" is the kit's footer-6, "dark" is footer-11.
export function Footer({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  const heading = cx('text-h5', dark ? 'text-white' : 'text-ink')
  const link = cx('text-h6 transition-colors', dark ? 'text-white hover:text-primary' : 'text-body hover:text-primary')
  const social = <SocialLinks size={24} className="gap-5 text-primary" itemClassName="hover:text-primary-hover" />

  return (
    <footer className={dark ? 'bg-dark' : 'bg-white'}>
      <div className={dark ? 'bg-dark' : 'bg-gray-1'}>
        <div className="container-x flex flex-col items-start justify-between gap-5 py-10 sm:flex-row sm:items-center">
          {dark ? (
            <>
              <div className="flex flex-col gap-2.5">
                <p className="text-h3 text-white">Style that works as hard as you do</p>
                <p className="text-p text-white">Questions about an order or a size? We are here to help.</p>
              </div>
              <ButtonLink to="/contact">Contact Us</ButtonLink>
            </>
          ) : (
            <>
              <Brand />
              {social}
            </>
          )}
        </div>
      </div>

      {!dark && (
        <div className="container-x">
          <hr className="border-line" />
        </div>
      )}

      <div className="container-x py-[50px]">
        <div className="flex flex-col gap-[30px] lg:flex-row">
          <div className="grid flex-1 grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-5">
                <h2 className={heading}>{column.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to} className={link}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-5 lg:w-[321px]">
            <h2 className={heading}>Get In Touch</h2>
            {dark ? (
              <ul className="flex flex-col gap-2.5 text-h6 text-white">
                <li className="flex items-center gap-2.5">
                  <BiPhone size={24} className="shrink-0 text-primary" aria-hidden />
                  <a href={site.phoneHref} className="hover:text-primary">
                    {site.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <BiMap size={24} className="shrink-0 text-primary" aria-hidden />
                  {site.location}
                </li>
                <li className="flex items-center gap-2.5">
                  <BsSend size={20} className="mx-0.5 shrink-0 text-primary" aria-hidden />
                  <a href={`mailto:${site.email}`} className="break-all hover:text-primary">
                    {site.email}
                  </a>
                </li>
              </ul>
            ) : (
              <SubscribeForm hint="New arrivals and offers, no more than twice a month" />
            )}
          </div>
        </div>
      </div>

      <div className={dark ? 'bg-dark' : 'bg-gray-1'}>
        <div className="container-x flex flex-col items-center justify-between gap-4 py-[25px] sm:flex-row">
          <p className={cx('text-center text-h6 sm:text-left', dark ? 'text-white' : 'text-body')}>
            &copy; {new Date().getFullYear()} {site.name}. Designed and built by{' '}
            <a
              href={site.owner.url}
              target="_blank"
              rel="noreferrer"
              className={cx('underline-offset-4 hover:underline', dark ? 'text-primary' : 'text-primary')}
            >
              {site.owner.name}
            </a>
          </p>
          {dark && social}
        </div>
      </div>
    </footer>
  )
}
