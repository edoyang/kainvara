import mongoose, { Schema, type Model } from 'mongoose'
import { baseOptions } from './shared.js'

export interface IPost {
  title: string
  slug: string
  excerpt: string
  body: string[]
  image: string
  tags: string[]
  author: string
  badge: string
  commentCount: number
  publishedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '' },
    body: { type: [String], default: [] },
    image: { type: String, default: '' },
    tags: { type: [String], default: [] },
    author: { type: String, default: '' },
    badge: { type: String, default: '' },
    commentCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: () => new Date(), index: true },
  },
  baseOptions,
)

export const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) ?? mongoose.model<IPost>('Post', postSchema)
