import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cx } from '../../lib/format.ts'

type Variant =
  | 'primary'
  | 'success'
  | 'dark'
  | 'outline-primary'
  | 'outline-success'
  | 'outline-light'
  | 'faded'
  | 'danger'

type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  success: 'bg-success text-white hover:bg-success-hover',
  dark: 'bg-dark text-white hover:bg-black',
  'outline-primary': 'border border-primary text-primary hover:bg-primary hover:text-white',
  'outline-success': 'border border-success text-success hover:bg-success hover:text-white',
  'outline-light': 'border border-gray-1 text-gray-1 hover:bg-white hover:text-ink',
  faded: 'bg-primary-faded text-primary hover:bg-primary hover:text-white',
  danger: 'border border-danger text-danger hover:bg-danger hover:text-white',
}

// Sizes match the kit's button Sm (44px), button Md (52px) and button Lg (62px).
const SIZES: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-h6',
  md: 'px-10 py-[15px] text-btn',
  lg: 'px-10 py-[15px] text-h3',
}

interface StyleProps {
  variant?: Variant
  size?: Size
  round?: boolean
  block?: boolean
}

function buttonClass({ variant = 'primary', size = 'md', round, block }: StyleProps, extra?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2.5 text-center transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60',
    round ? 'rounded-[37px]' : 'rounded-[5px]',
    block && 'w-full',
    VARIANTS[variant],
    SIZES[size],
    extra,
  )
}

interface ButtonProps extends StyleProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export function Button({ variant, size, round, block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, round, block }, className)}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends StyleProps, LinkProps {
  children: ReactNode
}

export function ButtonLink({ variant, size, round, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass({ variant, size, round, block }, className)}>
      {children}
    </Link>
  )
}
