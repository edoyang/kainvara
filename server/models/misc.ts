import mongoose, { Schema, type Model } from 'mongoose'
import { baseOptions } from './shared.js'

export interface ISubscriber {
  email: string
}

const subscriberSchema = new Schema<ISubscriber>(
  { email: { type: String, required: true, unique: true, lowercase: true, trim: true } },
  baseOptions,
)

export const Subscriber: Model<ISubscriber> =
  (mongoose.models.Subscriber as Model<ISubscriber>) ??
  mongoose.model<ISubscriber>('Subscriber', subscriberSchema)

export interface IMessage {
  name: string
  email: string
  subject: string
  message: string
  read: boolean
}

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  baseOptions,
)

export const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ?? mongoose.model<IMessage>('Message', messageSchema)

export interface ICoupon {
  code: string
  description: string
  percentOff: number
  minSubtotal: number
  active: boolean
  expiresAt: Date | null
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    percentOff: { type: Number, required: true, min: 1, max: 100 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  baseOptions,
)

export const Coupon: Model<ICoupon> =
  (mongoose.models.Coupon as Model<ICoupon>) ?? mongoose.model<ICoupon>('Coupon', couponSchema)

// Written by the keep-alive job so the cluster always sees recent activity.
export interface IHeartbeat {
  key: string
  lastPingAt: Date
  count: number
  source: string
}

const heartbeatSchema = new Schema<IHeartbeat>(
  {
    key: { type: String, required: true, unique: true },
    lastPingAt: { type: Date, required: true },
    count: { type: Number, default: 0 },
    source: { type: String, default: '' },
  },
  baseOptions,
)

export const Heartbeat: Model<IHeartbeat> =
  (mongoose.models.Heartbeat as Model<IHeartbeat>) ??
  mongoose.model<IHeartbeat>('Heartbeat', heartbeatSchema)

export interface IRateLimit {
  key: string
  count: number
  expiresAt: Date
}

const rateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // TTL index: Mongo removes the bucket once its window has passed.
  expiresAt: { type: Date, required: true, expires: 0 },
})

export const RateLimit: Model<IRateLimit> =
  (mongoose.models.RateLimit as Model<IRateLimit>) ??
  mongoose.model<IRateLimit>('RateLimit', rateLimitSchema)
