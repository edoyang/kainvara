import mongoose, { Schema, type Model, type Types } from 'mongoose'
import { baseOptions } from './shared.js'

export interface IReview {
  product: Types.ObjectId
  user: Types.ObjectId
  userName: string
  rating: number
  title: string
  comment: string
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true },
    comment: { type: String, required: true, trim: true },
  },
  baseOptions,
)

// One review per customer per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

export const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ?? mongoose.model<IReview>('Review', reviewSchema)
