import { useState, type FormEvent } from 'react'
import { BsBoxSeam } from 'react-icons/bs'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AddressFields } from '../components/account/AddressFields.tsx'
import { StatusBadge } from '../components/account/OrderBits.tsx'
import { Button, ButtonLink } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Field.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { EmptyState, ErrorState, Spinner } from '../components/ui/States.tsx'
import { Seo } from '../components/Seo.tsx'
import { useAuth } from '../context/auth.ts'
import { useToast } from '../context/toast.ts'
import { useQuery } from '../hooks/useQuery.ts'
import { emptyAddress } from '../lib/address.ts'
import { api, ApiError, errorMessage } from '../lib/api.ts'
import { withoutError } from '../lib/forms.ts'
import { cx, formatDate, money, plural } from '../lib/format.ts'
import type { Address, Order, User } from '../types.ts'

function Profile({ user }: { user: User }) {
  const { updateProfile } = useAuth()
  const { notify } = useToast()
  const [name, setName] = useState(user.name)
  const [address, setAddress] = useState<Address>(user.address ?? { ...emptyAddress, fullName: user.name })
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})

  const hasAddress = Object.entries(address).some(([key, value]) => key !== 'fullName' && value.trim())

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setFields({})
    try {
      // An untouched address form is saved as "no address" instead of failing validation.
      await updateProfile(name, hasAddress ? address : null)
      notify('Your details are saved')
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields)
      else notify(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-[30px]" noValidate>
      <section>
        <h2 className="text-h3">Your details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            maxLength={80}
            error={fields.name}
          />
          <Input label="Email" value={user.email} readOnly disabled hint="Your email is used to sign in" />
        </div>
      </section>

      <section>
        <h2 className="text-h3">Default delivery address</h2>
        <p className="mt-1 mb-5 text-p">Used to fill in checkout for you. Leave it empty if you prefer.</p>
        <AddressFields
          value={address}
          onChange={(next, changedKey) => {
            setAddress(next)
            setFields((current) => withoutError(current, changedKey))
          }}
          errors={fields}
          prefix="address"
        />
      </section>

      <Button type="submit" loading={busy} className="self-start">
        Save Changes
      </Button>
    </form>
  )
}

function Password() {
  const { notify } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (newPassword !== confirm) {
      setFields({ confirm: 'The two passwords do not match' })
      return
    }
    setBusy(true)
    setFields({})
    try {
      await api('/auth/password', { method: 'PUT', body: { currentPassword, newPassword } })
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      notify('Your password was changed')
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields)
      else notify(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-[420px] flex-col gap-5" noValidate>
      <h2 className="text-h3">Change password</h2>
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        error={fields.currentPassword}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        error={fields.newPassword}
        hint="At least 8 characters"
      />
      <Input
        label="Repeat new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={fields.confirm}
      />
      <Button type="submit" loading={busy} className="self-start">
        Update Password
      </Button>
    </form>
  )
}

function Orders() {
  const { data, error, reload } = useQuery('/orders', (signal) => api<Order[]>('/orders', { signal }))

  if (error && !data) return <ErrorState message={error} onRetry={reload} />
  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<BsBoxSeam />}
        title="No orders yet"
        message="When you place an order it will appear here, with its status and details."
        action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
      />
    )
  }

  return (
    <div>
      <h2 className="text-h3">Your orders</h2>
      <ul className="mt-5 flex flex-col gap-4">
        {data.map((order) => (
          <li key={order.id}>
            <Link
              to={`/order/${order.number}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[5px] border border-gray-2 p-5 transition-colors hover:border-primary"
            >
              <span>
                <span className="block text-h5 text-ink">{order.number}</span>
                <span className="block text-p">
                  {formatDate(order.createdAt)} / {plural(order.items.reduce((sum, item) => sum + item.quantity, 0), 'item')}
                </span>
              </span>
              <span className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="text-h5 text-ink">{money(order.total)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TABS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/orders', label: 'Orders', end: false },
  { to: '/account/password', label: 'Password', end: false },
]

export default function Account({ tab }: { tab: 'profile' | 'orders' | 'password' }) {
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  // RequireAuth renders this page only for signed in visitors.
  if (!user) return null

  async function signOut() {
    try {
      await logout()
      notify('You are signed out', 'info')
      navigate('/')
    } catch {
      notify('Could not sign out, please try again', 'error')
    }
  }

  return (
    <>
      <Seo title="My account" noindex />
      <PageHeader title="My Account" crumbs={[{ label: 'My account' }]} />

      <section className="bg-white">
        <div className="container-x grid gap-[30px] py-12 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-[5px] bg-gray-1 p-[25px]">
            <p className="truncate text-h5 text-ink">{user.name}</p>
            <p className="truncate text-small">{user.email}</p>
            <nav aria-label="Account" className="mt-5 flex flex-col gap-1">
              {TABS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx(
                      'rounded-[5px] px-4 py-2.5 text-h6 transition-colors',
                      isActive ? 'bg-primary text-white' : 'text-body hover:bg-white hover:text-primary',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user.role === 'admin' && (
                <Link to="/admin" className="rounded-[5px] px-4 py-2.5 text-h6 text-body hover:bg-white hover:text-primary">
                  Store admin
                </Link>
              )}
              <button
                type="button"
                onClick={signOut}
                className="rounded-[5px] px-4 py-2.5 text-left text-h6 text-danger hover:bg-white"
              >
                Sign out
              </button>
            </nav>
          </aside>

          <div>
            {tab === 'profile' && <Profile user={user} />}
            {tab === 'orders' && <Orders />}
            {tab === 'password' && <Password />}
          </div>
        </div>
      </section>
    </>
  )
}
