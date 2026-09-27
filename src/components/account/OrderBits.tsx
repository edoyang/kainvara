import { Link } from 'react-router-dom'
import { addressLines } from '../../lib/address.ts'
import { cx, img, money } from '../../lib/format.ts'
import { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_LABEL } from '../../lib/orders.ts'
import type { Order, OrderStatus } from '../../types.ts'

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = ORDER_STATUS[status]
  return <span className={cx('inline-block rounded-[37px] px-3 py-0.5 text-h6', className)}>{label}</span>
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cx('flex justify-between gap-4', strong ? 'text-h5 text-ink' : 'text-h6 text-body')}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

// Items, totals and delivery details of one order. Shared by the customer
// order page and the admin order view.
export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid gap-[30px] lg:grid-cols-[1fr_360px]">
      <div className="rounded-[5px] border border-gray-2 p-[25px]">
        <h2 className="text-h5">Items</h2>
        <ul className="mt-2 divide-y divide-gray-2">
          {order.items.map((item) => (
            <li key={`${item.product}-${item.color}-${item.size}`} className="flex items-center gap-4 py-4">
              <Link
                to={`/product/${item.slug}`}
                className="h-[84px] w-16 shrink-0 overflow-hidden rounded-[5px] bg-gray-2"
                tabIndex={-1}
                aria-hidden
              >
                <img src={img(item.image, 128, 168)} alt="" loading="lazy" className="size-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${item.slug}`} className="text-h6 text-ink hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-small">
                  {[`Qty ${item.quantity}`, item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' / ')}
                </p>
                <p className="text-small">{money(item.price)} each</p>
              </div>
              <p className="text-h6 text-ink">{money(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-[30px]">
        <div className="rounded-[5px] bg-gray-1 p-[25px]">
          <h2 className="text-h5">Summary</h2>
          <dl className="mt-4 flex flex-col gap-3">
            <Row label="Subtotal" value={money(order.subtotal)} />
            {order.discount > 0 && (
              <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`- ${money(order.discount)}`} />
            )}
            <Row label={SHIPPING_LABEL[order.shippingMethod]} value={order.shipping === 0 ? 'Free' : money(order.shipping)} />
            <hr className="border-muted" />
            <Row label="Total" value={money(order.total)} strong />
            <Row label="Payment" value={PAYMENT_STATUS[order.payment.status]} />
          </dl>
        </div>

        <div className="rounded-[5px] border border-gray-2 p-[25px]">
          <h2 className="text-h5">Delivery address</h2>
          <address className="mt-3 text-p not-italic">
            {addressLines(order.shippingAddress).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          {order.note && (
            <>
              <h3 className="mt-4 text-h6">Order note</h3>
              <p className="text-p">{order.note}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
