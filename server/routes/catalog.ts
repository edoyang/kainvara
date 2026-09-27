import { Router } from 'express'
import type { QueryFilter } from 'mongoose'
import { z } from 'zod'
import { currentUser, requireAuth } from '../auth.js'
import { HttpError, parse, rateLimit } from '../http.js'
import { Category } from '../models/Category.js'
import { Product, type IProduct } from '../models/Product.js'
import { Review } from '../models/Review.js'
import { User } from '../models/User.js'

export const catalog = Router()

const SORTS = {
  popularity: { salesCount: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  'price-asc': { price: 1, _id: 1 },
  'price-desc': { price: -1, _id: 1 },
  rating: { rating: -1, reviewCount: -1, _id: 1 },
} as const

const flag = z.enum(['1', 'true']).optional()

const listQuery = z.object({
  category: z.string().max(60).optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(['popularity', 'newest', 'price-asc', 'price-desc', 'rating']).default('popularity'),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  color: z.string().max(40).optional(),
  featured: flag,
  bestseller: flag,
  sale: flag,
})

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

catalog.get('/categories', async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }),
    Product.aggregate<{ _id: unknown; count: number }>([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ])
  const countById = new Map(counts.map((entry) => [String(entry._id), entry.count]))
  res.json(
    categories.map((category) => ({
      ...category.toJSON(),
      productCount: countById.get(category.id as string) ?? 0,
    })),
  )
})

catalog.get('/products', async (req, res) => {
  const query = parse(listQuery, req.query)
  const filter: QueryFilter<IProduct> = { active: true }

  if (query.category) {
    const category = await Category.findOne({ slug: query.category.toLowerCase() }).select('_id')
    if (!category) {
      res.json({ items: [], total: 0, page: 1, pages: 1, limit: query.limit })
      return
    }
    filter.category = category._id
  }
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i')
    filter.$or = [{ name: pattern }, { department: pattern }, { tags: pattern }, { summary: pattern }]
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {
      ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
    }
  }
  if (query.color) filter['colors.name'] = new RegExp(`^${escapeRegex(query.color)}$`, 'i')
  if (query.featured) filter.featured = true
  if (query.bestseller) filter.bestseller = true
  if (query.sale) filter.compareAtPrice = { $ne: null }

  const total = await Product.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / query.limit))
  const page = Math.min(query.page, pages)
  const items = await Product.find(filter)
    .sort(SORTS[query.sort])
    .skip((page - 1) * query.limit)
    .limit(query.limit)
    .populate('category', 'name slug')

  res.json({ items, total, page, pages, limit: query.limit })
})

catalog.get('/products/facets', async (_req, res) => {
  const [colors, prices] = await Promise.all([
    Product.aggregate<{ _id: { name: string; hex: string }; count: number }>([
      { $match: { active: true } },
      { $unwind: '$colors' },
      { $group: { _id: { name: '$colors.name', hex: '$colors.hex' }, count: { $sum: 1 } } },
      { $sort: { count: -1, '_id.name': 1 } },
    ]),
    Product.aggregate<{ _id: null; min: number; max: number }>([
      { $match: { active: true } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]),
  ])
  res.json({
    colors: colors.map((entry) => ({ ...entry._id, count: entry.count })),
    minPrice: prices[0]?.min ?? 0,
    maxPrice: prices[0]?.max ?? 0,
  })
})

async function findProduct(slug: string) {
  const product = await Product.findOne({ slug: slug.toLowerCase(), active: true }).populate(
    'category',
    'name slug',
  )
  if (!product) throw new HttpError(404, 'Product not found')
  return product
}

catalog.get('/products/:slug', async (req, res) => {
  const product = await findProduct(req.params.slug)
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category._id,
    active: true,
  })
    .sort({ salesCount: -1 })
    .limit(8)
    .populate('category', 'name slug')
  res.json({ product, related })
})

catalog.get('/products/:slug/reviews', async (req, res) => {
  const product = await findProduct(req.params.slug)
  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(50)
  res.json(reviews)
})

const reviewBody = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(80).default(''),
  comment: z.string().trim().min(3, 'Please write a few words').max(1000),
})

catalog.post('/products/:slug/reviews', requireAuth, rateLimit('review', 10, 600), async (req, res) => {
  const body = parse(reviewBody, req.body)
  const session = currentUser(res)
  const [product, user] = await Promise.all([findProduct(String(req.params.slug)), User.findById(session.id)])
  if (!user) throw new HttpError(401, 'Please sign in to continue')

  // Posting again edits the existing review, so ratings cannot be stacked.
  const review = await Review.findOneAndUpdate(
    { product: product._id, user: user._id },
    { ...body, userName: user.name },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )

  const [stats] = await Review.aggregate<{ _id: null; rating: number; count: number }>([
    { $match: { product: product._id } },
    { $group: { _id: null, rating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  product.rating = Math.round((stats?.rating ?? 0) * 10) / 10
  product.reviewCount = stats?.count ?? 0
  await product.save()

  res.status(201).json({ review, rating: product.rating, reviewCount: product.reviewCount })
})
