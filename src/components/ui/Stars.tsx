import { BsStar, BsStarFill, BsStarHalf } from 'react-icons/bs'
import { cx } from '../../lib/format.ts'

interface StarsProps {
  rating: number
  size?: number
  className?: string
}

export function Stars({ rating, size = 22, className }: StarsProps) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <span
      className={cx('inline-flex items-center gap-[5px] text-[#f3cd03]', className)}
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const Icon = rounded >= star ? BsStarFill : rounded >= star - 0.5 ? BsStarHalf : BsStar
        return <Icon key={star} size={size} aria-hidden />
      })}
    </span>
  )
}

interface StarInputProps {
  value: number
  onChange: (value: number) => void
}

export function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          onClick={() => onChange(star)}
          className="rounded p-1 text-[#f3cd03] transition-transform hover:scale-110"
        >
          {value >= star ? <BsStarFill size={24} /> : <BsStar size={24} />}
        </button>
      ))}
    </div>
  )
}
