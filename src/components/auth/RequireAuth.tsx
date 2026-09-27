import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth.ts'
import { EmptyState, PageLoader } from '../ui/States.tsx'
import { ButtonLink } from '../ui/Button.tsx'

interface RequireAuthProps {
  children: ReactNode
  admin?: boolean
}

// The API enforces access on every request. This only decides what to show.
export function RequireAuth({ children, admin }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (admin && user.role !== 'admin') {
    return (
      <EmptyState
        className="min-h-[50vh] justify-center"
        title="Admins only"
        message="This area is for store staff. Your account does not have access to it."
        action={<ButtonLink to="/">Back to home</ButtonLink>}
      />
    )
  }
  return children
}
