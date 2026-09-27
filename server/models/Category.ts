import mongoose, { Schema, type Model } from 'mongoose'
import { baseOptions } from './shared.js'

export interface ICategory {
  name: string
  slug: string
  description: string
  image: string
  order: number
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  baseOptions,
)

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ?? mongoose.model<ICategory>('Category', categorySchema)
