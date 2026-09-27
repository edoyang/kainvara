import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/api.ts'
import type { Product } from '../types.ts'
import { useAuth } from './auth.ts'
import { WishlistContext, type WishlistApi } from './wishlist.ts'

const STORAGE_KEY = 'kainvara.wishlist.v1'
const GUEST = 'guest'
const MAX_ITEMS = 100
const NO_IDS: string[] = []

interface Stored {
  owner: string
  ids: string[]
}

function load(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Stored> | null
    if (parsed && typeof parsed.owner === 'string' && Array.isArray(parsed.ids)) {
      return { owner: parsed.owner, ids: parsed.ids.filter((id) => typeof id === 'string') }
    }
  } catch {
    // Unreadable storage is treated as an empty wishlist.
  }
  return { owner: GUEST, ids: [] }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const identity = user?.id ?? GUEST
  const [stored, setStored] = useState<Stored>(load)
  const pendingPush = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Storage can be blocked (private mode), the wishlist still works in memory.
    }
  }, [stored])

  useEffect(() => {
    if (authLoading) return
    const controller = new AbortController()
    const { signal } = controller
    const local = load()

    async function sync(): Promise<Stored> {
      if (identity === GUEST) {
        return local.owner === GUEST ? local : { owner: GUEST, ids: [] }
      }
      const server = await api<Product[]>('/wishlist', { signal })
      const serverIds = server.map((product) => product.id)
      if (local.owner !== GUEST || !local.ids.length) return { owner: identity, ids: serverIds }

      const merged = [...new Set([...serverIds, ...local.ids])].slice(0, MAX_ITEMS)
      const saved = await api<Product[]>('/wishlist', { method: 'PUT', body: { ids: merged }, signal })
      return { owner: identity, ids: saved.map((product) => product.id) }
    }

    sync().then(
      (next) => {
        if (!signal.aborted) setStored(next)
      },
      () => undefined,
    )
    return () => controller.abort()
  }, [authLoading, identity])

  useEffect(() => {
    if (!pendingPush.current || identity === GUEST || stored.owner !== identity) return
    const timer = window.setTimeout(() => {
      pendingPush.current = false
      api('/wishlist', { method: 'PUT', body: { ids: stored.ids } }).catch(() => undefined)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [stored, identity])

  const ids = stored.owner === identity || stored.owner === GUEST ? stored.ids : NO_IDS

  const toggle = useCallback(
    (productId: string) => {
      const adding = !ids.includes(productId)
      pendingPush.current = true
      setStored({
        owner: identity,
        ids: adding ? [...ids, productId].slice(-MAX_ITEMS) : ids.filter((id) => id !== productId),
      })
      return adding
    },
    [ids, identity],
  )

  const value = useMemo<WishlistApi>(
    () => ({ ids, count: ids.length, has: (productId) => ids.includes(productId), toggle }),
    [ids, toggle],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
