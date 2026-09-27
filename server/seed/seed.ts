import { Types } from 'mongoose'
import { hashPassword } from '../auth.js'
import { connectDb } from '../db.js'
import { adminSeed } from '../env.js'
import { Category } from '../models/Category.js'
import { Coupon } from '../models/misc.js'
import { Post } from '../models/Post.js'
import { Product } from '../models/Product.js'
import { Review } from '../models/Review.js'
import { User } from '../models/User.js'
import { categories, coupons, demoUser, posts, products, reviewComments, reviewers } from './data.js'

export interface SeedSummary {
  categories: number
  products: number
  newProducts: number
  reviews: number
  posts: number
  coupons: number
  admin: boolean
}

// Small deterministic hash, so the sample reviews are the same on every run.
function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

async function seedReviews(productId: Types.ObjectId, slug: string): Promise<number> {
  const seed = hash(slug)
  const count = 3 + (seed % 6)
  const docs = Array.from({ length: count }, (_, index) => {
    const pick = reviewComments[(seed + index * 7) % reviewComments.length]
    return {
      product: productId,
      // Sample reviews belong to no real account, each gets its own id so the
      // one review per customer index is respected.
      user: new Types.ObjectId(),
      userName: reviewers[(seed + index * 3) % reviewers.length],
      rating: pick.rating,
      title: pick.title,
      comment: pick.comment,
      createdAt: new Date(Date.UTC(2026, 5, 1 + ((seed + index * 11) % 100))),
    }
  })
  await Review.insertMany(docs)
  const rating = docs.reduce((sum, doc) => sum + doc.rating, 0) / docs.length
  await Product.updateOne(
    { _id: productId },
    { rating: Math.round(rating * 10) / 10, reviewCount: docs.length },
  )
  return docs.length
}

// Safe to run at any time: everything is matched on its slug, code or email.
// Catalog text is refreshed, while live values (stock, sales, ratings) are
// only set when a product is first created.
export async function seedDatabase(): Promise<SeedSummary> {
  await connectDb()

  const categoryIds = new Map<string, Types.ObjectId>()
  for (const category of categories) {
    const doc = await Category.findOneAndUpdate({ slug: category.slug }, category, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    })
    categoryIds.set(category.slug, doc!._id)
  }

  let newProducts = 0
  let reviews = 0
  for (const product of products) {
    const { stock, salesCount, category, ...fields } = product
    const result = await Product.updateOne(
      { slug: product.slug },
      {
        $set: { ...fields, category: categoryIds.get(category) },
        $setOnInsert: { stock, salesCount, rating: 0, reviewCount: 0, active: true },
      },
      { upsert: true },
    )
    if (result.upsertedId) {
      newProducts++
      reviews += await seedReviews(result.upsertedId, product.slug)
    }
  }

  for (const post of posts) {
    await Post.updateOne(
      { slug: post.slug },
      { $set: { ...post, publishedAt: new Date(post.publishedAt) } },
      { upsert: true },
    )
  }

  for (const coupon of coupons) {
    await Coupon.updateOne(
      { code: coupon.code },
      { $set: coupon, $setOnInsert: { active: true, expiresAt: null } },
      { upsert: true },
    )
  }

  if (!(await User.exists({ email: demoUser.email }))) {
    await User.create({
      name: demoUser.name,
      email: demoUser.email,
      passwordHash: await hashPassword(demoUser.password),
    })
  }

  // The admin account only exists when ADMIN_EMAIL and ADMIN_PASSWORD are set.
  const adminAccount = adminSeed()
  if (adminAccount) {
    await User.updateOne(
      { email: adminAccount.email },
      {
        $set: { role: 'admin', passwordHash: await hashPassword(adminAccount.password) },
        $setOnInsert: { name: 'Store Admin' },
      },
      { upsert: true },
    )
  }

  return {
    categories: categories.length,
    products: products.length,
    newProducts,
    reviews,
    posts: posts.length,
    coupons: coupons.length,
    admin: Boolean(adminAccount),
  }
}

interface SeedCache {
  check: Promise<void> | null
}

const globalCache = globalThis as typeof globalThis & { __seedCache?: SeedCache }
const cache: SeedCache = (globalCache.__seedCache ??= { check: null })

// Runs once per server instance: an empty database (first deploy, or a wiped
// cluster) gets the catalog without anyone having to run the seed script.
export function ensureSeeded(): Promise<void> {
  cache.check ??= (async () => {
    const existing = await Product.estimatedDocumentCount()
    if (existing === 0) await seedDatabase()
  })().catch((err: unknown) => {
    cache.check = null
    throw err
  })
  return cache.check
}
