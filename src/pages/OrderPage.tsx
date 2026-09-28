import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { BsCheckCircleFill, BsCreditCard2Back, BsHourglassSplit, BsInfoCircleFill } from 'react-icons/bs'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { OrderDetails, StatusBadge } from '../components/account/OrderBits.tsx'
import { TestModeNote } from '../components/cart/PaymentNote.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { ErrorState, PageLoader } from '../components/ui/States.tsx'
import { Seo } from '../components/Seo.tsx'
import { useToast } from '../context/toast.ts'
import { goToPayment, usePaymentConfig } from '../hooks/useCheckout.ts'
import { clearQueryCache, useQuery } from '../hooks/useQuery.ts'
import { api, errorMessage } from '../lib/api.ts'
import { cx, formatDate } from '../lib/format.ts'
import type { Order } from '../types.ts'

const TONES = {
  success: 'border-success bg-success/10',
  info: 'border-primary bg-primary-faded/30',
  alert: 'border-alert bg-alert/10',
}

function Notice({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof TONES
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className={cx('flex items-start gap-4 rounded-[5px] border p-[25px]', TONES[tone])} role="status">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <h2 className="text-h3">{title}</h2>
        <div className="mt-1 text-p">{children}</div>
      </div>
    </div>
  )
}

export default function OrderPage() {
  const { number = '' } = useParams()
  const location = useLocation()
  const [params] = useSearchParams()
  const { notify } = useToast()
  const justPlaced = Boolean((location.state as { placed?: boolean } | null)?.placed)
  // Set by the address Stripe sends the shopper back to.
  const returned = params.get('payment')
  const path = `/orders/${encodeURIComponent(number)}`
  const { data: order, error, reload } = useQuery(path, (signal) => api<Order>(path, { signal }))
  const payments = usePaymentConfig()
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(returned === 'success')

  // The webhook records the payment as well, asking here means the page is
  // right the moment the shopper lands on it.
  const checkPayment = useCallback(async () => {
    await api<Order>('/payments/confirm', { method: 'POST', body: { orderNumber: number } })
    clearQueryCache('/orders')
    reload()
  }, [number, reload])

  useEffect(() => {
    if (returned !== 'success') return
    let active = true
    checkPayment()
      .catch(() => null)
      .then(() => {
        if (active) setChecking(false)
      })
    return () => {
      active = false
    }
  }, [returned, checkPayment])

  async function cancel() {
    setCancelling(true)
    try {
      await api(`${path}/cancel`, { method: 'POST' })
      clearQueryCache('/orders')
      notify('Your order was cancelled', 'info')
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
      reload()
    } finally {
      setCancelling(false)
      setConfirming(false)
    }
  }

  async function pay() {
    setPaying(true)
    try {
      if (await goToPayment(number)) return
      clearQueryCache('/orders')
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
    }
    setPaying(false)
  }

  async function checkAgain() {
    setChecking(true)
    try {
      await checkPayment()
    } catch (err) {
      notify(errorMessage(err), 'error')
    }
    setChecking(false)
  }

  const paid = order?.payment.status === 'paid'
  const awaitingPayment = order?.status === 'pending' && !paid
  const canPay = awaitingPayment && payments.data?.enabled === true

  return (
    <>
      <Seo title={`Order ${number}`} noindex />
      <PageHeader
        title="Order details"
        crumbs={[{ label: 'My account', to: '/account' }, { label: 'Orders', to: '/account/orders' }, { label: number }]}
      />

      <section className="bg-white">
        <div className="container-x flex flex-col gap-[30px] py-12">
          {error && !order ? (
            <ErrorState message={error} onRetry={reload} />
          ) : !order ? (
            <PageLoader />
          ) : (
            <>
              {returned === 'success' && paid && (
                <Notice
                  tone="success"
                  icon={<BsCheckCircleFill size={28} className="text-success" aria-hidden />}
                  title="Thank you, your payment was received"
                >
                  Order {order.number} is paid. You can follow its progress from this page at any time.
                </Notice>
              )}

              {returned === 'success' && awaitingPayment && (
                <Notice
                  tone="info"
                  icon={<BsHourglassSplit size={28} className="text-primary" aria-hidden />}
                  title={checking ? 'Checking your payment' : 'Your payment is still being confirmed'}
                >
                  <p>This usually takes a few seconds. You do not need to pay again.</p>
                  {!checking && (
                    <Button size="sm" variant="outline-primary" className="mt-3" onClick={checkAgain}>
                      Check again
                    </Button>
                  )}
                </Notice>
              )}

              {returned === 'cancelled' && awaitingPayment && (
                <Notice
                  tone="alert"
                  icon={<BsInfoCircleFill size={28} className="text-alert" aria-hidden />}
                  title="The payment was not completed"
                >
                  Nothing was charged. Your items are still reserved, you can pay whenever you are ready.
                </Notice>
              )}

              {justPlaced && order.status !== 'cancelled' && (
                <Notice
                  tone="success"
                  icon={<BsCheckCircleFill size={28} className="text-success" aria-hidden />}
                  title="Thank you, your order is confirmed"
                >
                  We have reserved your items. Keep the order number {order.number} for your records.
                </Notice>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-h3 text-ink">{order.number}</p>
                  <p className="text-p">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {canPay && (
                <div className="flex flex-col gap-4 rounded-[5px] border border-gray-2 p-[25px]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-h5">Pay for this order</h2>
                      <p className="mt-1 text-p">
                        Your items are reserved. Pay by card on a secure page run by Stripe.
                      </p>
                    </div>
                    <Button loading={paying} onClick={pay} disabled={checking}>
                      <BsCreditCard2Back aria-hidden />
                      Pay Now
                    </Button>
                  </div>
                  {payments.data?.mode === 'test' && <TestModeNote />}
                </div>
              )}

              <OrderDetails order={order} />

              <div className="flex flex-wrap items-center gap-2.5">
                <ButtonLink to="/shop" size="sm">
                  Continue Shopping
                </ButtonLink>
                <ButtonLink to="/account/orders" size="sm" variant="outline-primary">
                  All my orders
                </ButtonLink>
                {order.status === 'pending' &&
                  (confirming ? (
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="text-h6 text-ink">Cancel this order?</span>
                      <Button size="sm" variant="danger" loading={cancelling} onClick={cancel}>
                        Yes, cancel it
                      </Button>
                      <Button size="sm" variant="outline-primary" onClick={() => setConfirming(false)}>
                        Keep order
                      </Button>
                    </span>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
                      Cancel Order
                    </Button>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
