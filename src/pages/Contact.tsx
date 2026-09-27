import type { ReactNode } from 'react'
import { BsEnvelopeFill, BsLinkedin, BsTelephone } from 'react-icons/bs'
import { ContactForm } from '../components/inner/ContactForm.tsx'
import { InnerHero } from '../components/inner/InnerHero.tsx'
import { SocialLogos } from '../components/inner/Sections.tsx'
import { cx } from '../lib/format.ts'
import { media, pageTitle, site } from '../lib/site.ts'

interface CardProps {
  icon: ReactNode
  lines: string[]
  title: string
  action: string
  href: string
  dark?: boolean
}

// The kit's "desktop-contact-7" card. The middle one is dark and taller.
function Card({ icon, lines, title, action, href, dark }: CardProps) {
  const external = href.startsWith('http')
  return (
    <li
      className={cx(
        'flex flex-col items-center gap-[15px] px-10 text-center',
        dark ? 'bg-dark py-20 text-white' : 'bg-white py-[50px] text-ink',
      )}
    >
      <span className="text-[72px] leading-none text-primary" aria-hidden>
        {icon}
      </span>
      <p className="text-h6">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <h3 className={cx('text-h5', dark && 'text-white')}>{title}</h3>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="rounded-[37px] border border-primary px-9 py-[15px] text-h6 text-primary transition-colors hover:bg-primary hover:text-white"
      >
        {action}
      </a>
    </li>
  )
}

export default function Contact() {
  return (
    <>
      <title>{pageTitle('Contact us')}</title>
      <InnerHero
        eyebrow="Contact us"
        title={
          <>
            Get in touch <br className="hidden sm:block" />
            today!
          </>
        }
        text="Questions about an order, a size, or how this store was built? Send a message any time."
        image={media.contactHero}
        imageAlt="A member of our customer care team"
      >
        <p className="flex flex-col gap-5 text-h3 text-ink">
          <a href={site.phoneHref} className="hover:text-primary">
            Phone : {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="break-all hover:text-primary">
            Email : {site.email}
          </a>
        </p>
        <SocialLogos className="-ml-2.5" />
      </InnerHero>

      <section className="bg-white">
        <div className="container-x flex flex-col gap-20 py-20 lg:py-[112px]">
          <div className="mx-auto flex max-w-[625px] flex-col items-center gap-2.5 text-center">
            <p className="text-h6 text-ink">WAYS TO REACH US</p>
            <h2 className="text-h2">Pick whichever is easiest for you</h2>
          </div>
          <ul className="mx-auto grid w-full max-w-[985px] items-center md:grid-cols-3">
            <Card
              icon={<BsTelephone />}
              lines={[site.phone, site.location]}
              title="Call Us"
              action="Call Now"
              href={site.phoneHref}
            />
            <Card
              dark
              icon={<BsLinkedin />}
              lines={[site.owner.name, 'Software Engineer']}
              title="Connect"
              action="Open LinkedIn"
              href={site.social.linkedin}
            />
            <Card
              icon={<BsEnvelopeFill />}
              lines={[site.email, 'Or use the form below']}
              title="Get Support"
              action="Submit Request"
              href="#message"
            />
          </ul>
        </div>
      </section>

      {/* The kit's "desktop-cta-3" with the hand drawn arrow */}
      <section className="bg-white">
        <div className="container-x flex flex-col items-center gap-4 pb-20 text-center">
          <svg width="73" height="85" viewBox="0 0 73 85" fill="none" className="text-primary" aria-hidden>
            <path
              d="M2 2c24 3 44 17 52 38 5 13 4 27-2 40m0 0-14-13m14 13 17-9"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-h5 text-ink">WE WOULD LOVE TO HEAR FROM YOU</p>
          <h2 className="text-h2 lg:text-h1">Let's Talk</h2>
          <a
            href="#message"
            className="rounded-[5px] bg-primary px-10 py-[15px] text-btn text-white transition-colors hover:bg-primary-hover"
          >
            Send us a message
          </a>
        </div>
      </section>

      <ContactForm />
    </>
  )
}
