import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OrderDetails, StatusBadge } from '../../components/account/OrderBits.tsx'
import { Select } from '../../components/ui/Field.tsx'
import { Pagination } from '../../components/ui/Pagination.tsx'
import { ErrorState, Spinner } from '../../components/ui/States.tsx'
import { useToast } from '../../context/toast.ts'
import { clearQueryCache, useQuery } from '../../hooks/useQuery.ts'
import { api, errorMessage, withQuery } from '../../lib/api.ts'
import { cx, formatDate, money } from '../../lib/format.ts'
import { ORDER_STATUS_OPTIONS } from '../../lib/orders.ts'
import type { Order, OrderStatus, Paged } from '../../types.ts'

export default function AdminOrders() {
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const status = ORDER_STATUS_OPTIONS.find((option) => option.value === params.get('status'))?.value
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const path = withQuery('/admin/orders', { page, status, limit: 15 })
  const { data, error, loading, reload } = useQuery(path, (signal) => api<Paged<Order>>(path, { signal }), {
    keepPrevious: true,
  })

  async function changeStatus(order: Order, next: OrderStatus) {
    setSavingId(order.id)
    try {
      await api(`/admin/orders/${order.id}`, {
        method: 'PUT',
        body: { status: next, paymentStatus: next === 'paid' ? 'paid' : undefined },
      })
      clearQueryCache()
      notify(`Order ${order.number} is now ${next}`)
      reload()
    } catch (err) {
      notify(errorMessage(err), 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Show"
        value={status ?? ''}
        onChange={(event) => {
          setPage(1)
          setParams(event.target.value ? { status: event.target.value } : {})
        }}
        wrapperClassName="w-[240px]"
      >
        <option value="">All orders</option>
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <p className="text-p">No orders to show.</p>
      ) : (
        <>
          <ul className={cx('flex flex-col gap-4', loading && 'opacity-60')}>
            {data.items.map((order) => {
              const open = openId === order.id
              return (
                <li key={order.id} className="rounded-[5px] border border-gray-2">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-h5 text-ink">{order.number}</p>
                      <p className="text-small">
                        {order.email} / {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <StatusBadge status={order.status} />
                      <span className="text-h5 text-ink">{money(order.total)}</span>
                      <Select
                        aria-label={`Change status of ${order.number}`}
                        value={order.status}
                        disabled={savingId === order.id || order.status === 'cancelled'}
                        onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}
                        className="h-11 min-w-[170px]"
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : order.id)}
                        aria-expanded={open}
                        className="text-h6 text-primary hover:text-primary-hover"
                      >
                        {open ? 'Hide details' : 'View details'}
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div className="border-t border-gray-2 p-4">
                      <OrderDetails order={order} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
