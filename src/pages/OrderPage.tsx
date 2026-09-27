import { useState } from 'react'
import { BsCheckCircleFill } from 'react-icons/bs'
import { useLocation, useParams } from 'react-router-dom'
import { OrderDetails, StatusBadge } from '../components/account/OrderBits.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { ErrorState, PageLoader } from '../components/ui/States.tsx'
import { useToast } from '../context/toast.ts'
import { clearQueryCache, useQuery } from '../hooks/useQuery.ts'
import { api, errorMessage } from '../lib/api.ts'
import { formatDate } from '../lib/format.ts'
import { pageTitle } from '../lib/site.ts'
import type { Order } from '../types.ts'

export default function OrderPage() {
  const { number = '' } = useParams()
  const location = useLocation()
  const { notify } = useToast()
  const justPlaced = Boolean((location.state as { placed?: boolean } | null)?.placed)
  const path = `/orders/${encodeURIComponent(number)}`
  const { data: order, error, reload } = useQuery(path, (signal) => api<Order>(path, { signal }))
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function cancel() {
    setCancelling(true)
    try {
      await api(`${path}/cancel`, { method: 'POST' })
      clearQueryCache('/orders')
      notify('Your order was cancelled', 'info')
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
    } finally {
      setCancelling(false)
      setConfirming(false)
    }
  }

  return (
    <>
      <title>{pageTitle(`Order ${number}`)}</title>
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
              {justPlaced && order.status !== 'cancelled' && (
                <div className="flex items-start gap-4 rounded-[5px] border border-success bg-success/10 p-[25px]">
                  <BsCheckCircleFill size={28} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  <div>
                    <h2 className="text-h3">Thank you, your order is confirmed</h2>
                    <p className="mt-1 text-p">
                      We have reserved your items. Keep the order number {order.number} for your records.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-h3 text-ink">{order.number}</p>
                  <p className="text-p">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

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
