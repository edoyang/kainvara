import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/api.ts'
import type { CartLine, Product } from '../types.ts'
import { useAuth } from './auth.ts'
import { CartContext, lineKey, toItems, type AddOptions, type CartApi } from './cart.ts'

const STORAGE_KEY = 'kainvara.cart.v1'
const GUEST = 'guest'
const MAX_PER_LINE = 99
const NO_LINES: CartLine[] = []

interface Stored {
  // 'guest' or the id of the signed in user the lines belong to.
  owner: string
  lines: CartLine[]
}

interface Resolved {
  lines: CartLine[]
  removed: string[]
}

function load(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Stored> | null
    if (parsed && typeof parsed.owner === 'string' && Array.isArray(parsed.lines)) {
      return { owner: parsed.owner, lines: parsed.lines }
    }
  } catch {
    // Unreadable storage is treated as an empty cart.
  }
  return { owner: GUEST, lines: [] }
}

function save(stored: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage can be blocked (private mode), the cart still works in memory.
  }
}

function mergeLines(server: CartLine[], guest: CartLine[]): CartLine[] {
  const merged = new Map(server.map((line) => [lineKey(line), line]))
  for (const line of guest) {
    const existing = merged.get(lineKey(line))
    merged.set(lineKey(line), existing ? { ...existing, quantity: Math.max(existing.quantity, line.quantity) } : line)
  }
  return [...merged.values()]
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const identity = user?.id ?? GUEST
  const [stored, setStored] = useState<Stored>(load)
  const pendingPush = useRef(false)

  useEffect(() => save(stored), [stored])

  // Runs when the session is known and whenever the signed in user changes.
  useEffect(() => {
    if (authLoading) return
    const controller = new AbortController()
    const { signal } = controller
    const local = load()

    async function sync(): Promise<Stored> {
      if (identity === GUEST) {
        // A cart left behind by a signed out account is not shown to the next visitor.
        if (local.owner !== GUEST || !local.lines.length) return { owner: GUEST, lines: [] }
        const fresh = await api<Resolved>('/cart/resolve', {
          method: 'POST',
          body: { items: toItems(local.lines) },
          signal,
        })
        return { owner: GUEST, lines: fresh.lines }
      }

      const server = await api<Resolved>('/cart', { signal })
      if (local.owner !== GUEST || !local.lines.length) return { owner: identity, lines: server.lines }

      // Signing in keeps whatever was added as a guest.
      const merged = await api<Resolved>('/cart', {
        method: 'PUT',
        body: { items: toItems(mergeLines(server.lines, local.lines)) },
        signal,
      })
      return { owner: identity, lines: merged.lines }
    }

    sync().then(
      (next) => {
        if (signal.aborted) return
        // Anything added while the sync was in flight is kept.
        const changedMeanwhile = pendingPush.current
        setStored((current) =>
          changedMeanwhile ? { owner: next.owner, lines: mergeLines(next.lines, current.lines) } : next,
        )
      },
      () => undefined,
    )
    return () => controller.abort()
  }, [authLoading, identity])

  // Signed in carts are saved to the account shortly after each change.
  useEffect(() => {
    if (!pendingPush.current || identity === GUEST || stored.owner !== identity) return
    const timer = window.setTimeout(() => {
      pendingPush.current = false
      api('/cart', { method: 'PUT', body: { items: toItems(stored.lines) } }).catch(() => undefined)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [stored, identity])

  const update = useCallback(
    (change: (lines: CartLine[]) => CartLine[]) => {
      pendingPush.current = true
      setStored((current) => ({
        owner: identity,
        lines: change(current.owner === identity || current.owner === GUEST ? current.lines : []),
      }))
    },
    [identity],
  )

  const add = useCallback(
    (product: Product, options: Partial<AddOptions> = {}) => {
      const color = options.color ?? product.colors[0]?.name ?? ''
      const size = options.size ?? product.sizes[0] ?? ''
      const limit = Math.min(product.stock, MAX_PER_LINE)
      const key = lineKey({ productId: product.id, color, size })

      update((lines) => {
        const existing = lines.find((line) => lineKey(line) === key)
        const quantity = Math.max(1, Math.min((existing?.quantity ?? 0) + (options.quantity ?? 1), limit))
        const line: CartLine = {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          department: product.department,
          image: product.images[0] ?? '',
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          quantity,
          color,
          size,
          lineTotal: quantity * product.price,
        }
        return existing ? lines.map((item) => (lineKey(item) === key ? line : item)) : [...lines, line]
      })
    },
    [update],
  )

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      update((lines) =>
        lines.map((line) => {
          if (lineKey(line) !== key) return line
          const next = Math.max(1, Math.min(quantity, line.stock, MAX_PER_LINE))
          return { ...line, quantity: next, lineTotal: next * line.price }
        }),
      )
    },
    [update],
  )

  const remove = useCallback(
    (key: string) => update((lines) => lines.filter((line) => lineKey(line) !== key)),
    [update],
  )

  const clear = useCallback(() => update(() => []), [update])

  const replace = useCallback(
    (lines: CartLine[]) => {
      setStored({ owner: identity, lines })
    },
    [identity],
  )

  // Lines that belong to a different account are never shown.
  const lines = stored.owner === identity || stored.owner === GUEST ? stored.lines : NO_LINES

  const value = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
      add,
      setQuantity,
      remove,
      clear,
      replace,
    }),
    [lines, add, setQuantity, remove, clear, replace],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
