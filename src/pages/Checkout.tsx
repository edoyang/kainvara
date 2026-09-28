import { useState, type FormEvent, type ReactNode } from 'react'
import { BsCreditCard2Back, BsShieldLock } from 'react-icons/bs'
import { Navigate, useNavigate } from 'react-router-dom'
import { AddressFields } from '../components/account/AddressFields.tsx'
import { OrderSummary } from '../components/cart/OrderSummary.tsx'
import { TestModeNote } from '../components/cart/PaymentNote.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { Textarea } from '../components/ui/Field.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/States.tsx'
import { Seo } from '../components/Seo.tsx'
import { useAuth } from '../context/auth.ts'
import { lineKey, toItems, useCart } from '../context/cart.ts'
import { useToast } from '../context/toast.ts'
import {
  goToPayment,
  useCheckoutPrefs,
  usePaymentConfig,
  useQuote,
  useShippingMethods,
} from '../hooks/useCheckout.ts'
import { clearQueryCache } from '../hooks/useQuery.ts'
import { emptyAddress } from '../lib/address.ts'
import { api, ApiError, errorMessage } from '../lib/api.ts'
import { withoutError } from '../lib/forms.ts'
import { cx, img, money } from '../lib/format.ts'
import type { Address, Order, User } from '../types.ts'

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[5px] border border-gray-2 p-[25px]">
      <h2 className="flex items-center gap-3 text-h3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-h6 text-white">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { lines, replace } = useCart()
  const { notify } = useToast()
  const [prefs, setPrefs] = useCheckoutPrefs()
  const methods = useShippingMethods()
  const quote = useQuote(lines, prefs.shippingMethod, prefs.couponCode)

  const [address, setAddress] = useState<Address>(() => ({
    ...emptyAddress,
    ...(user?.address ?? { fullName: user?.name ?? '' }),
  }))
  const [note, setNote] = useState('')
  const [saveAddress, setSaveAddress] = useState(true)
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const payments = usePaymentConfig()
  const cardPayment = payments.data?.enabled === true

  // After the order is placed the cart is empty, the redirect below must not win.
  if (lines.length === 0 && !placed) return <Navigate to="/cart" replace />

  if (leaving) {
    return (
      <>
        <Seo title="Checkout" noindex />
        <PageHeader title="Checkout" crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
        <section className="bg-white">
          <div className="container-x flex min-h-[50vh] flex-col items-center justify-center gap-5 py-12 text-center">
            <Spinner />
            <h2 className="text-h3">Taking you to the secure payment page</h2>
            <p className="text-p">Your order is reserved. Please do not close this page.</p>
          </div>
        </section>
      </>
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setFields({})
    setFormError('')
    try {
      const order = await api<Order>('/orders', {
        method: 'POST',
        body: {
          items: toItems(lines),
          shippingAddress: address,
          shippingMethod: prefs.shippingMethod,
          couponCode: quote.data?.coupon ? prefs.couponCode : '',
          note,
          saveAddress,
        },
      })
      setPlaced(true)
      replace([])
      setPrefs({ couponCode: '' })
      clearQueryCache()
      if (saveAddress && user) setUser({ ...user, address } satisfies User)

      if (cardPayment) {
        setLeaving(true)
        try {
          // The browser leaves for the payment page and comes back to the order.
          if (await goToPayment(order.number)) return
        } catch (err) {
          notify(`${errorMessage(err)} Your order is reserved, you can pay from this page.`, 'error')
        }
        setLeaving(false)
        navigate(`/order/${order.number}`, { replace: true })
        return
      }
      notify(`Order ${order.number} is confirmed`)
      navigate(`/order/${order.number}`, { replace: true, state: { placed: true } })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setFields(err.fields)
        setFormError('Please check the highlighted fields.')
      } else {
        setFormError(errorMessage(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo title="Checkout" noindex />
      <PageHeader title="Checkout" crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <section className="bg-white">
        <form onSubmit={submit} className="container-x grid gap-[30px] py-12 lg:grid-cols-[1fr_360px]" noValidate>
          <div className="flex flex-col gap-[30px]">
            <Step number={1} title="Delivery address">
              <AddressFields
                value={address}
                onChange={(next, changedKey) => {
                  setAddress(next)
                  setFields((current) => withoutError(current, changedKey))
                }}
                errors={fields}
                prefix="shippingAddress"
              />
              <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-h6 text-ink">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  className="size-[18px] cursor-pointer accent-primary"
                />
                Save this address to my account
              </label>
            </Step>

            <Step number={2} title="Delivery method">
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Delivery method</legend>
                {(methods.data ?? []).map((method) => {
                  const selected = prefs.shippingMethod === method.id
                  const free =
                    method.freeOver !== null &&
                    quote.data !== undefined &&
                    quote.data.subtotal - quote.data.discount >= method.freeOver
                  return (
                    <label
                      key={method.id}
                      className={cx(
                        'flex cursor-pointer items-center gap-4 rounded-[5px] border p-4 transition-colors',
                        selected ? 'border-primary bg-primary-faded/30' : 'border-gray-2 hover:border-primary',
                      )}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={selected}
                        onChange={() => setPrefs({ shippingMethod: method.id })}
                        className="size-[18px] cursor-pointer accent-primary"
                      />
                      <span className="flex-1">
                        <span className="block text-h6 text-ink">{method.label}</span>
                        <span className="block text-p">{method.eta}</span>
                      </span>
                      <span className={cx('text-h6', free ? 'text-success' : 'text-ink')}>
                        {free ? 'Free' : money(method.price)}
                      </span>
                    </label>
                  )
                })}
              </fieldset>
              <Textarea
                label="Order note (optional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Anything the courier should know?"
                error={fields.note}
                wrapperClassName="mt-5"
              />
            </Step>

            <Step number={3} title="Payment">
              <div className="flex items-start gap-4 rounded-[5px] bg-gray-1 p-4">
                <BsCreditCard2Back size={28} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                {cardPayment ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-h6 text-ink">Pay by card on the next page</p>
                    <p className="text-p">
                      Placing the order reserves your items and takes you to a secure payment page run by
                      Stripe. Your card details go to Stripe only and never pass through this store.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-h6 text-ink">Card payment is not switched on</p>
                    <p className="text-p">
                      Your order is reserved now and no payment is taken. Once card payment is switched on
                      you will be able to pay from your order page.
                    </p>
                  </div>
                )}
              </div>
              {cardPayment && payments.data?.mode === 'test' && <TestModeNote className="mt-4" />}
            </Step>
          </div>

          <div className="flex flex-col gap-[30px]">
            <div className="rounded-[5px] border border-gray-2 p-[25px]">
              <h2 className="text-h5">In your order</h2>
              <ul className="mt-4 flex flex-col gap-4">
                {lines.map((line) => (
                  <li key={lineKey(line)} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-[5px] bg-gray-2">
                      <img src={img(line.image, 112, 112)} alt="" className="size-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-h6 text-ink">{line.name}</span>
                      <span className="block text-small">
                        {[`Qty ${line.quantity}`, line.color, line.size].filter(Boolean).join(' / ')}
                      </span>
                    </span>
                    <span className="text-h6 text-ink">{money(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <OrderSummary
              quote={quote.data}
              loading={quote.loading}
              couponCode={prefs.couponCode}
              onCouponChange={(couponCode) => setPrefs({ couponCode })}
            >
              {formError && (
                <p className="rounded-[5px] border border-danger bg-white p-3 text-h6 text-danger" role="alert">
                  {formError}
                </p>
              )}
              <Button type="submit" block loading={busy} disabled={!quote.data || payments.loading}>
                {cardPayment ? 'Place Order and Pay' : 'Place Order'}
              </Button>
              <ButtonLink to="/cart" variant="outline-primary" block>
                Back to Cart
              </ButtonLink>
              <p className="flex items-center justify-center gap-2 text-small">
                <BsShieldLock className="text-success" aria-hidden />
                Your details are sent over an encrypted connection
              </p>
            </OrderSummary>
          </div>
        </form>
      </section>
    </>
  )
}
