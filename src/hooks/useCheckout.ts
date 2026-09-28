import { useCallback, useState } from 'react'
import { toItems } from '../context/cart.ts'
import { api } from '../lib/api.ts'
import type {
  CartLine,
  CheckoutStart,
  PaymentConfig,
  Quote,
  ShippingMethod,
  ShippingMethodId,
} from '../types.ts'
import { useQuery } from './useQuery.ts'

const PREFS_KEY = 'kainvara.checkout.v1'

interface Prefs {
  couponCode: string
  shippingMethod: ShippingMethodId
}

function loadPrefs(): Prefs {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(PREFS_KEY) ?? 'null') as Partial<Prefs> | null
    return {
      couponCode: typeof parsed?.couponCode === 'string' ? parsed.couponCode : '',
      shippingMethod: parsed?.shippingMethod === 'express' ? 'express' : 'standard',
    }
  } catch {
    return { couponCode: '', shippingMethod: 'standard' }
  }
}

// The coupon and delivery choice made in the cart carry over to checkout.
export function useCheckoutPrefs() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  const update = useCallback((changes: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...changes }
      try {
        sessionStorage.setItem(PREFS_KEY, JSON.stringify(next))
      } catch {
        // Session storage can be blocked, the choice then lasts for this page only.
      }
      return next
    })
  }, [])

  return [prefs, update] as const
}

// Totals always come from the server, which prices the cart from the database.
export function useQuote(lines: CartLine[], shippingMethod: ShippingMethodId, couponCode: string) {
  const items = toItems(lines)
  const key = items.length ? `quote:${JSON.stringify([items, shippingMethod, couponCode])}` : null
  return useQuery(
    key,
    (signal) =>
      api<Quote>('/orders/quote', { method: 'POST', body: { items, shippingMethod, couponCode }, signal }),
    { keepPrevious: true },
  )
}

export function useShippingMethods() {
  return useQuery('shipping-methods', (signal) => api<ShippingMethod[]>('/shipping-methods', { signal }))
}

export function usePaymentConfig() {
  return useQuery('payments-config', (signal) => api<PaymentConfig>('/payments/config', { signal }))
}

// Leaves the site for the Stripe payment page of an order. Returns false when
// Stripe already holds the payment, so there is nothing left to pay.
export async function goToPayment(orderNumber: string): Promise<boolean> {
  const checkout = await api<CheckoutStart>('/payments/checkout-session', {
    method: 'POST',
    body: { orderNumber },
  })
  if (checkout.paid) return false
  window.location.assign(checkout.url)
  return true
}
