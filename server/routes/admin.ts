import { Router } from 'express'
import { z } from 'zod'
import { requireAdmin } from '../auth.js'
import { HttpError, objectId, parse } from '../http.js'
import { Category } from '../models/Category.js'
import { Message, Subscriber } from '../models/misc.js'
import { Order, ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { slugify } from '../models/shared.js'
import { User } from '../models/User.js'

export const admin = Router()

admin.use('/admin', requireAdmin)

admin.get('/admin/stats', async (_req, res) => {
  const [products, lowStock, customers, subscribers, unreadMessages, orderStats, recentOrders] = await Promise.all([
    Product.countDocuments({ active: true }),
    Product.countDocuments({ active: true, stock: { $lte: 5 } }),
    User.countDocuments({ role: 'customer' }),
    Subscriber.countDocuments(),
    Message.countDocuments({ read: false }),
    Order.aggregate<{ _id: string; count: number; revenue: number }>([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5),
  ])
  const live = orderStats.filter((entry) => entry._id !== 'cancelled')
  res.json({
    products,
    lowStock,
    customers,
    subscribers,
    unreadMessages,
    orders: live.reduce((sum, entry) => sum + entry.count, 0),
    revenue: live.reduce((sum, entry) => sum + entry.revenue, 0),
    byStatus: Object.fromEntries(orderStats.map((entry) => [entry._id, entry.count])),
    recentOrders,
  })
})

const imageUrl = z.url('Enter a valid image URL').max(500).refine((value) => value.startsWith('https://'), {
  message: 'Image URLs must use https',
})

const productBody = z.object({
  name: z.string().trim().min(2, 'Enter a product name').max(120),
  department: z.string().trim().max(80).default(''),
  categoryId: objectId,
  summary: z.string().trim().max(300).default(''),
  description: z.string().trim().max(4000).default(''),
  highlights: z.array(z.string().trim().min(1).max(160)).max(10).default([]),
  price: z.coerce.number().int().min(0).max(10_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(10_000_000).nullable().default(null),
  images: z.array(imageUrl).min(1, 'Add at least one image').max(8),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex color like #23A6F0'),
      }),
    )
    .max(10)
    .default([]),
  sizes: z.array(z.string().trim().min(1).max(20)).max(12).default([]),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  active: z.boolean().default(true),
})

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || 'product'
  for (let attempt = 0; attempt < 50; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`
    const clash = await Product.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select('_id')
    if (!clash) return slug
  }
  throw new HttpError(409, 'Could not create a unique link for that name')
}

async function toProductFields(body: z.infer<typeof productBody>) {
  if (!(await Category.exists({ _id: body.categoryId }))) {
    throw new HttpError(400, 'Choose a category', { categoryId: 'Choose a category' })
  }
  if (body.compareAtPrice !== null && body.compareAtPrice <= body.price) {
    throw new HttpError(400, 'The original price must be higher than the price', {
      compareAtPrice: 'The original price must be higher than the price',
    })
  }
  const { categoryId, ...fields } = body
  return { ...fields, category: categoryId }
}

admin.get('/admin/products', async (req, res) => {
  const query = parse(
    z.object({
      page: z.coerce.number().int().min(1).max(500).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      q: z.string().trim().max(80).optional(),
    }),
    req.query,
  )
  const filter = query.q
    ? { name: new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    : {}
  const total = await Product.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / query.limit))
  const page = Math.min(query.page, pages)
  const items = await Product.find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip((page - 1) * query.limit)
    .limit(query.limit)
    .populate('category', 'name slug')
  res.json({ items, total, page, pages, limit: query.limit })
})

admin.post('/admin/products', async (req, res) => {
  const fields = await toProductFields(parse(productBody, req.body))
  const product = await Product.create({ ...fields, slug: await uniqueSlug(fields.name) })
  res.status(201).json(await product.populate('category', 'name slug'))
})

admin.put('/admin/products/:id', async (req, res) => {
  const id = parse(objectId, req.params.id)
  const fields = await toProductFields(parse(productBody, req.body))
  const product = await Product.findById(id)
  if (!product) throw new HttpError(404, 'Product not found')
  if (product.name !== fields.name) product.slug = await uniqueSlug(fields.name, id)
  product.set(fields)
  await product.save()
  res.json(await product.populate('category', 'name slug'))
})

// Products are archived instead of deleted, so past orders keep their links.
admin.delete('/admin/products/:id', async (req, res) => {
  const id = parse(objectId, req.params.id)
  const product = await Product.findByIdAndUpdate(id, { active: false }, { returnDocument: 'after' })
  if (!product) throw new HttpError(404, 'Product not found')
  res.json(product)
})

admin.get('/admin/orders', async (req, res) => {
  const query = parse(
    z.object({
      page: z.coerce.number().int().min(1).max(500).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(ORDER_STATUSES).optional(),
    }),
    req.query,
  )
  const filter = query.status ? { status: query.status } : {}
  const total = await Order.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / query.limit))
  const page = Math.min(query.page, pages)
  const items = await Order.find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip((page - 1) * query.limit)
    .limit(query.limit)
  res.json({ items, total, page, pages, limit: query.limit })
})

admin.put('/admin/orders/:id', async (req, res) => {
  const id = parse(objectId, req.params.id)
  const body = parse(
    z.object({ status: z.enum(ORDER_STATUSES), paymentStatus: z.enum(PAYMENT_STATUSES).optional() }),
    req.body,
  )
  const order = await Order.findById(id)
  if (!order) throw new HttpError(404, 'Order not found')

  const wasCancelled = order.status === 'cancelled'
  if (wasCancelled && body.status !== 'cancelled') {
    throw new HttpError(409, 'A cancelled order cannot be reopened, its stock was already returned')
  }
  order.status = body.status
  if (body.paymentStatus) {
    order.payment.status = body.paymentStatus
    order.payment.paidAt = body.paymentStatus === 'paid' ? (order.payment.paidAt ?? new Date()) : order.payment.paidAt
  }
  await order.save()

  if (!wasCancelled && body.status === 'cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, salesCount: -item.quantity } }),
      ),
    )
  }
  res.json(order)
})

admin.get('/admin/messages', async (_req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).limit(200))
})

admin.put('/admin/messages/:id', async (req, res) => {
  const id = parse(objectId, req.params.id)
  const body = parse(z.object({ read: z.boolean() }), req.body)
  const message = await Message.findByIdAndUpdate(id, { read: body.read }, { returnDocument: 'after' })
  if (!message) throw new HttpError(404, 'Message not found')
  res.json(message)
})

admin.get('/admin/subscribers', async (_req, res) => {
  res.json(await Subscriber.find().sort({ createdAt: -1 }).limit(1000))
})
