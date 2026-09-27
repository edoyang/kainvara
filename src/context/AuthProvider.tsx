import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearQueryCache } from '../hooks/useQuery.ts'
import { api } from '../lib/api.ts'
import type { Address, User } from '../types.ts'
import { AuthContext, type AuthApi } from './auth.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    api<User | null>('/auth/me', { signal: controller.signal })
      .then((current) => setUser(current))
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const next = await api<User>('/auth/login', { method: 'POST', body: { email, password } })
    clearQueryCache()
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const next = await api<User>('/auth/register', { method: 'POST', body: { name, email, password } })
    clearQueryCache()
    setUser(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' })
    clearQueryCache()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (name: string, address?: Address | null) => {
    const next = await api<User>('/auth/profile', { method: 'PUT', body: { name, address } })
    setUser(next)
    return next
  }, [])

  const value = useMemo<AuthApi>(
    () => ({ user, loading, login, register, logout, updateProfile, setUser }),
    [user, loading, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
