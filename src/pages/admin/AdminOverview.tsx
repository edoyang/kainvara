import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/account/OrderBits.tsx'
import { ErrorState, Skeleton } from '../../components/ui/States.tsx'
import { useQuery } from '../../hooks/useQuery.ts'
import { api } from '../../lib/api.ts'
import { formatDate, money } from '../../lib/format.ts'
import type { AdminStats } from '../../types.ts'

export default function AdminOverview() {
  const { data, error, reload } = useQuery('/admin/stats', (signal) => api<AdminStats>('/admin/stats', { signal }))

  if (error && !data) return <ErrorState message={error} onRetry={reload} />
  if (!data) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-[110px]" />
        ))}
      </div>
    )
  }

  const tiles = [
    { label: 'Revenue (excluding cancelled)', value: money(data.revenue), to: '/admin/orders' },
    { label: 'Orders', value: String(data.orders), to: '/admin/orders' },
    { label: 'Active products', value: String(data.products), to: '/admin/products' },
    { label: 'Low stock (5 or fewer)', value: String(data.lowStock), to: '/admin/products' },
    { label: 'Customers', value: String(data.customers), to: '/admin' },
    { label: 'Awaiting payment', value: String(data.byStatus.pending ?? 0), to: '/admin/orders?status=pending' },
    { label: 'Unread messages', value: String(data.unreadMessages), to: '/admin/messages' },
    { label: 'Subscribers', value: String(data.subscribers), to: '/admin/subscribers' },
  ]

  return (
    <div className="flex flex-col gap-[30px]">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              to={tile.to}
              className="flex h-full flex-col gap-2 rounded-[5px] border border-gray-2 p-5 transition-colors hover:border-primary"
            >
              <span className="text-h6 text-body">{tile.label}</span>
              <span className="text-h3 text-ink">{tile.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="text-h3">Latest orders</h2>
        {data.recentOrders.length === 0 ? (
          <p className="mt-3 text-p">No orders have been placed yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-2 rounded-[5px] border border-gray-2">
            {data.recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <span>
                  <span className="block text-h6 text-ink">{order.number}</span>
                  <span className="block text-small">
                    {order.email} / {formatDate(order.createdAt)}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-h6 text-ink">{money(order.total)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
