import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { cx } from '../../lib/format.ts'
import { pageTitle } from '../../lib/site.ts'

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/messages', label: 'Messages', end: false },
  { to: '/admin/subscribers', label: 'Subscribers', end: false },
]

export default function Admin() {
  return (
    <>
      <title>{pageTitle('Store admin')}</title>
      <PageHeader title="Store Admin" crumbs={[{ label: 'Admin' }]} />

      <section className="bg-white">
        <div className="container-x flex flex-col gap-[30px] py-12">
          <nav aria-label="Admin" className="flex flex-wrap gap-2 border-b-2 border-gray-2 pb-4">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cx(
                    'rounded-[5px] px-5 py-2.5 text-h6 transition-colors',
                    isActive ? 'bg-primary text-white' : 'bg-gray-1 text-body hover:text-primary',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </div>
      </section>
    </>
  )
}
