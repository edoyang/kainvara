import mongoose, { Schema, type Model, type Types } from 'mongoose'
import { baseOptions } from './shared.js'

export type UserRole = 'customer' | 'admin'

export interface ICartItem {
  product: Types.ObjectId
  quantity: number
  color: string
  size: string
}

export interface IAddress {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface IUser {
  name: string
  email: string
  passwordHash: string
  role: UserRole
  address: IAddress | null
  cart: ICartItem[]
  wishlist: Types.ObjectId[]
}

export const addressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    line1: { type: String, default: '', trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true },
    country: { type: String, default: '', trim: true },
  },
  { _id: false },
)

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
  },
  { _id: false },
)

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: { type: addressSchema, default: null },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  baseOptions,
)

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', userSchema)
