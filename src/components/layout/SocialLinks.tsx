import { BsEnvelopeFill, BsGithub, BsInstagram, BsLinkedin } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'
import { site } from '../../lib/site.ts'

// Only the profiles that are filled in under site.social are shown.
const LINKS = [
  { label: 'LinkedIn', href: site.social.linkedin, Icon: BsLinkedin, color: '#0a66c2' },
  { label: 'GitHub', href: site.social.github, Icon: BsGithub, color: '#252b42' },
  { label: 'Instagram', href: site.social.instagram, Icon: BsInstagram, color: '#252b42' },
  { label: 'Email', href: `mailto:${site.email}`, Icon: BsEnvelopeFill, color: '#23a6f0' },
].filter((link) => Boolean(link.href))

interface SocialLinksProps {
  size: number
  className?: string
  itemClassName?: string
  // Each icon in its own colour (contact pages) instead of the text colour.
  colored?: boolean
}

export function SocialLinks({ size, className, itemClassName, colored }: SocialLinksProps) {
  return (
    <ul className={cx('flex items-center', className)}>
      {LINKS.map(({ label, href, Icon, color }) => {
        const external = href.startsWith('http')
        return (
          <li key={label}>
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              aria-label={label}
              className={cx('block transition-transform hover:scale-110', itemClassName)}
              style={colored ? { color } : undefined}
            >
              <Icon size={size} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
