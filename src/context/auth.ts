import { createContext, useContext } from 'react'
import type { Address, User } from '../types.ts'

export interface AuthApi {
  user: User | null
  // True until the first session check has finished.
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (name: string, address?: Address | null) => Promise<User>
  setUser: (user: User | null) => void
}

export const AuthContext = createContext<AuthApi | null>(null)

export function useAuth(): AuthApi {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
