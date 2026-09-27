import mongoose, { Schema, type Model, type Types } from 'mongoose'
import { baseOptions } from './shared.js'

export interface IProductColor {
  name: string
  hex: string
}

export interface IProduct {
  name: string
  slug: string
  department: string
  category: Types.ObjectId
  summary: string
  description: string
  highlights: string[]
  // Money is stored in cents to avoid floating point drift.
  price: number
  compareAtPrice: number | null
  images: string[]
  colors: IProductColor[]
  sizes: string[]
  stock: number
  rating: number
  reviewCount: number
  salesCount: number
  tags: string[]
  featured: boolean
  bestseller: boolean
  active: boolean
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, default: '', trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    images: { type: [String], default: [] },
    colors: {
      type: [new Schema<IProductColor>({ name: String, hex: String }, { _id: false })],
      default: [],
    },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  baseOptions,
)

productSchema.index({ name: 'text', department: 'text', summary: 'text', tags: 'text' })
productSchema.index({ price: 1 })
productSchema.index({ salesCount: -1 })

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ?? mongoose.model<IProduct>('Product', productSchema)
