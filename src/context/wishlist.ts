import { createContext, useContext } from 'react'

export interface WishlistApi {
  ids: string[]
  count: number
  has: (productId: string) => boolean
  // Returns true when the product was added, false when it was removed.
  toggle: (productId: string) => boolean
}

export const WishlistContext = createContext<WishlistApi | null>(null)

export function useWishlist(): WishlistApi {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
