import { createContext, useContext } from 'react'
import type { CartItemInput, CartLine, Product } from '../types.ts'

export interface AddOptions {
  quantity: number
  color: string
  size: string
}

export interface CartApi {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (product: Product, options?: Partial<AddOptions>) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  // Replaces the cart with lines the server has just priced and stock checked.
  replace: (lines: CartLine[]) => void
}

export const CartContext = createContext<CartApi | null>(null)

export function useCart(): CartApi {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}

export function lineKey(line: Pick<CartItemInput, 'productId' | 'color' | 'size'>): string {
  return `${line.productId}|${line.color}|${line.size}`
}

export function toItems(lines: CartLine[]): CartItemInput[] {
  return lines.map(({ productId, quantity, color, size }) => ({ productId, quantity, color, size }))
}
