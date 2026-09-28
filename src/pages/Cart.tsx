import { useEffect } from 'react'
import { BsBag, BsDash, BsPlus, BsTrash } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { OrderSummary } from '../components/cart/OrderSummary.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { EmptyState } from '../components/ui/States.tsx'
import { Seo } from '../components/Seo.tsx'
import { useAuth } from '../context/auth.ts'
import { lineKey, useCart } from '../context/cart.ts'
import { useToast } from '../context/toast.ts'
import { useCheckoutPrefs, useQuote } from '../hooks/useCheckout.ts'
import { img, money, plural } from '../lib/format.ts'
import type { CartLine } from '../types.ts'

function sameLines(a: CartLine[], b: CartLine[]): boolean {
  return (
    a.length === b.length &&
    a.every((line, index) => {
      const other = b[index]
      return (
        lineKey(line) === lineKey(other) &&
        line.quantity === other.quantity &&
        line.price === other.price &&
        line.stock === other.stock
      )
    })
  )
}

export default function Cart() {
  const { user } = useAuth()
  const { lines, count, setQuantity, remove, clear, replace } = useCart()
  const { notify } = useToast()
  const [prefs, setPrefs] = useCheckoutPrefs()
  const quote = useQuote(lines, prefs.shippingMethod, prefs.couponCode)

  // The server may correct the cart: a price changed, stock ran low, or a
  // product was withdrawn. The cart then follows what the server returned.
  useEffect(() => {
    if (!quote.data || quote.loading) return
    if (quote.data.removed.length) {
      notify(`No longer available: ${quote.data.removed.join(', ')}`, 'info')
    }
    if (!sameLines(quote.data.lines, lines)) replace(quote.data.lines)
  }, [quote.data, quote.loading, lines, replace, notify])

  const freeDeliveryGap = quote.data && quote.data.shipping > 0 ? 5000 - (quote.data.subtotal - quote.data.discount) : 0

  return (
    <>
      <Seo title="Your cart" noindex />
      <PageHeader title="Shopping Cart" crumbs={[{ label: 'Cart' }]} />

      <section className="bg-white">
        <div className="container-x py-12">
          {lines.length === 0 ? (
            <EmptyState
              icon={<BsBag />}
              title="Your cart is empty"
              message="Once you add something to your cart it will show up here."
              action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
            />
          ) : (
            <div className="grid gap-[30px] lg:grid-cols-[1fr_360px]">
              <div>
                <div className="flex items-center justify-between border-b-2 border-gray-2 pb-4">
                  <h2 className="text-h5">{plural(count, 'item')} in your cart</h2>
                  <button type="button" onClick={clear} className="text-h6 text-body hover:text-danger">
                    Clear cart
                  </button>
                </div>

                <ul className="divide-y divide-gray-2">
                  {lines.map((line) => {
                    const key = lineKey(line)
                    const options = [line.color, line.size && `Size ${line.size}`].filter(Boolean).join(' / ')
                    return (
                      <li key={key} className="flex gap-5 py-6">
                        <Link
                          to={`/product/${line.slug}`}
                          className="h-[130px] w-[100px] shrink-0 overflow-hidden rounded-[5px] bg-gray-2"
                          tabIndex={-1}
                          aria-hidden
                        >
                          <img src={img(line.image, 200, 260)} alt="" loading="lazy" className="size-full object-cover" />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-h5">
                              <Link to={`/product/${line.slug}`} className="hover:text-primary">
                                {line.name}
                              </Link>
                            </h3>
                            <p className="text-h6 text-body">{line.department}</p>
                            {options && <p className="text-p">{options}</p>}
                            <p className="mt-1 flex gap-[5px] text-h6">
                              {line.compareAtPrice !== null && line.compareAtPrice > line.price && (
                                <s className="text-muted">{money(line.compareAtPrice)}</s>
                              )}
                              <span className="text-secondary">{money(line.price)}</span>
                            </p>
                            {line.stock <= 5 && <p className="text-small text-alert">Only {line.stock} left</p>}
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex h-11 items-center rounded-[5px] border border-gray-2">
                              <button
                                type="button"
                                onClick={() => setQuantity(key, line.quantity - 1)}
                                disabled={line.quantity <= 1}
                                aria-label={`Decrease quantity of ${line.name}`}
                                className="flex h-full w-9 items-center justify-center text-ink hover:text-primary disabled:text-muted"
                              >
                                <BsDash size={20} />
                              </button>
                              <output className="w-8 text-center text-h6 text-ink" aria-label="Quantity">
                                {line.quantity}
                              </output>
                              <button
                                type="button"
                                onClick={() => setQuantity(key, line.quantity + 1)}
                                disabled={line.quantity >= Math.min(line.stock, 99)}
                                aria-label={`Increase quantity of ${line.name}`}
                                className="flex h-full w-9 items-center justify-center text-ink hover:text-primary disabled:text-muted"
                              >
                                <BsPlus size={20} />
                              </button>
                            </div>

                            <p className="w-[90px] text-right text-h5 text-ink">{money(line.lineTotal)}</p>

                            <button
                              type="button"
                              onClick={() => remove(key)}
                              aria-label={`Remove ${line.name} from cart`}
                              className="flex size-10 items-center justify-center rounded-full border border-[#e8e8e8] text-body transition-colors hover:border-danger hover:bg-danger hover:text-white"
                            >
                              <BsTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <OrderSummary
                quote={quote.data}
                loading={quote.loading}
                couponCode={prefs.couponCode}
                onCouponChange={(couponCode) => setPrefs({ couponCode })}
              >
                {freeDeliveryGap > 0 && (
                  <p className="text-small text-body">
                    Add {money(freeDeliveryGap)} more for free standard delivery.
                  </p>
                )}
                {quote.error && !quote.data && (
                  <p className="text-small text-danger" role="alert">
                    {quote.error}
                  </p>
                )}
                <ButtonLink to={user ? '/checkout' : '/login?next=%2Fcheckout'} block>
                  {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </ButtonLink>
                <ButtonLink to="/shop" variant="outline-primary" block>
                  Continue Shopping
                </ButtonLink>
              </OrderSummary>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
