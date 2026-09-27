import type { OrderStatus, PaymentStatus } from '../types.ts'

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Awaiting payment', className: 'bg-alert/15 text-alert' },
  paid: { label: 'Paid', className: 'bg-success/15 text-success' },
  processing: { label: 'Processing', className: 'bg-primary-faded text-primary-hover' },
  shipped: { label: 'Shipped', className: 'bg-primary-faded text-primary-hover' },
  delivered: { label: 'Delivered', className: 'bg-success/15 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-2 text-body' },
}

export const ORDER_STATUS_OPTIONS = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => ({
  value,
  label: ORDER_STATUS[value].label,
}))

export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  unpaid: 'Not paid yet',
  paid: 'Paid',
  refunded: 'Refunded',
  failed: 'Payment failed',
}

export const SHIPPING_LABEL = {
  standard: 'Standard delivery',
  express: 'Express delivery',
} as const
