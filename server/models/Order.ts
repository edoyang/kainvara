import mongoose, { Schema, type Model, type Types } from 'mongoose'
import { baseOptions } from './shared.js'
import { addressSchema, type IAddress } from './User.js'

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  color: string
  size: string
}

export interface IOrderPayment {
  // 'none' until the Stripe phase; then 'stripe' with the ids filled in.
  provider: 'none' | 'stripe'
  status: PaymentStatus
  stripeSessionId: string
  stripePaymentIntentId: string
  paidAt: Date | null
}

export interface IOrder {
  number: string
  user: Types.ObjectId
  email: string
  items: IOrderItem[]
  shippingAddress: IAddress
  shippingMethod: 'standard' | 'express'
  couponCode: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  status: OrderStatus
  payment: IOrderPayment
  note: string
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
  },
  { _id: false },
)

const paymentSchema = new Schema<IOrderPayment>(
  {
    provider: { type: String, enum: ['none', 'stripe'], default: 'none' },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid' },
    stripeSessionId: { type: String, default: '' },
    stripePaymentIntentId: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { _id: false },
)

const orderSchema = new Schema<IOrder>(
  {
    number: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    shippingMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
    couponCode: { type: String, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    payment: { type: paymentSchema, default: () => ({}) },
    note: { type: String, default: '' },
  },
  baseOptions,
)

export const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ?? mongoose.model<IOrder>('Order', orderSchema)
