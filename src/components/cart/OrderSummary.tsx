import { useState, type FormEvent, type ReactNode } from 'react'
import { BsTag, BsX } from 'react-icons/bs'
import { cx, money } from '../../lib/format.ts'
import type { Quote } from '../../types.ts'
import { fieldClass } from '../ui/fieldClass.ts'
import { Skeleton } from '../ui/States.tsx'

interface OrderSummaryProps {
  quote: Quote | undefined
  loading: boolean
  couponCode: string
  onCouponChange: (code: string) => void
  children?: ReactNode
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-4', strong ? 'text-h5 text-ink' : 'text-h6 text-body')}>
      <dt>{label}</dt>
      <dd className={tone}>{value}</dd>
    </div>
  )
}

export function OrderSummary({ quote, loading, couponCode, onCouponChange, children }: OrderSummaryProps) {
  const [code, setCode] = useState('')

  function apply(event: FormEvent) {
    event.preventDefault()
    if (code.trim()) onCouponChange(code.trim().toUpperCase())
    setCode('')
  }

  return (
    <aside className="h-fit rounded-[5px] bg-gray-1 p-[25px]" aria-label="Order summary">
      <h2 className="text-h3">Order Summary</h2>

      {quote?.coupon ? (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-[5px] border border-success bg-white px-4 py-3">
          <p className="flex items-center gap-2 text-h6 text-ink">
            <BsTag className="text-success" aria-hidden />
            {quote.coupon.code}
            <span className="font-normal text-body">{quote.coupon.description}</span>
          </p>
          <button
            type="button"
            onClick={() => onCouponChange('')}
            aria-label={`Remove code ${quote.coupon.code}`}
            className="text-xl text-muted hover:text-danger"
          >
            <BsX />
          </button>
        </div>
      ) : (
        <form onSubmit={apply} className="mt-5">
          <label htmlFor="coupon" className="mb-2.5 block text-h6 text-ink">
            Discount code
          </label>
          <div className="flex">
            <input
              id="coupon"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              maxLength={40}
              autoComplete="off"
              className={cx(fieldClass, 'h-[50px] min-w-0 rounded-r-none border-r-0 bg-white uppercase placeholder:normal-case')}
            />
            <button
              type="submit"
              className="shrink-0 rounded-r-[5px] bg-dark px-5 text-h6 text-white transition-colors hover:bg-black"
            >
              Apply
            </button>
          </div>
          {couponCode && quote?.couponError && (
            <p className="mt-1.5 text-small text-danger" role="alert">
              {quote.couponError}
            </p>
          )}
        </form>
      )}

      {quote ? (
        <dl className={cx('mt-6 flex flex-col gap-3 transition-opacity', loading && 'opacity-60')}>
          <Row label="Subtotal" value={money(quote.subtotal)} />
          {quote.discount > 0 && <Row label="Discount" value={`- ${money(quote.discount)}`} tone="text-success" />}
          <Row
            label="Delivery"
            value={quote.shipping === 0 ? 'Free' : money(quote.shipping)}
            tone={quote.shipping === 0 ? 'text-success' : undefined}
          />
          <hr className="border-muted" />
          <Row label="Total" value={money(quote.total)} strong />
        </dl>
      ) : (
        <div className="mt-6 flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-6" />
        </div>
      )}

      {children && <div className="mt-6 flex flex-col gap-3">{children}</div>}
    </aside>
  )
}
