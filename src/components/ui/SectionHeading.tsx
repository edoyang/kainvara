import { cx } from '../../lib/format.ts'

interface SectionHeadingProps {
  // Small line above the title: grey h4 ("Featured Products") or blue h6 ("From the Journal").
  eyebrow?: string
  eyebrowTone?: 'grey' | 'primary'
  title: string
  // h3 (24/32) for shop sections, h2 (40/50) for editorial sections.
  size?: 'h3' | 'h2'
  text?: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  eyebrowTone = 'grey',
  title,
  size = 'h3',
  text,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cx('mx-auto flex max-w-[692px] flex-col items-center gap-2.5 text-center', className)}>
      {eyebrow && (
        <p className={eyebrowTone === 'primary' ? 'text-h6 text-primary' : 'text-h4 text-body'}>{eyebrow}</p>
      )}
      <h2 className={size === 'h2' ? 'text-h2' : 'text-h3'}>{title}</h2>
      {text && <p className="max-w-[469px] text-p">{text}</p>}
    </div>
  )
}
