import { randomInt } from 'node:crypto'
import { Router } from 'express'
import { Types } from 'mongoose'
import { z } from 'zod'
import { currentUser, requireAuth } from '../auth.js'
import { HttpError, parse, rateLimit } from '../http.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { buildQuote, cartItemsSchema, findCoupon, SHIPPING_METHODS, type CartLine } from '../pricing.js'
import { addressSchema } from './auth.js'

export const orders = Router()

const shippingMethod = z.enum(['standard', 'express']).default('standard')
const couponCode = z.string().trim().max(40).default('')

orders.get('/shipping-methods', (_req, res) => {
  res.json(Object.entries(SHIPPING_METHODS).map(([id, method]) => ({ id, ...method })))
})

orders.post('/coupons/validate', rateLimit('coupon', 30, 600), async (req, res) => {
  const body = parse(z.object({ code: z.string().trim().min(1).max(40), subtotal: z.coerce.number().int().min(0) }), req.body)
  const coupon = await findCoupon(body.code, body.subtotal)
  res.json({ code: coupon.code, percentOff: coupon.percentOff, description: coupon.description })
})

orders.post('/orders/quote', async (req, res) => {
  const body = parse(z.object({ items: cartItemsSchema, shippingMethod, couponCode }), req.body)
  res.json(await buildQuote(body.items, body.shippingMethod, body.couponCode))
})

function orderNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += alphabet[randomInt(alphabet.length)]
  return `KV-${code}`
}

// Takes stock with a conditional update per line, so two shoppers can never
// both buy the last unit. Anything already taken is returned if a line fails.
async function reserveStock(lines: CartLine[]) {
  const reserved: CartLine[] = []
  for (const line of lines) {
    const result = await Product.updateOne(
      { _id: line.productId, active: true, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity, salesCount: line.quantity } },
    )
    if (result.modifiedCount !== 1) {
      await releaseStock(reserved)
      throw new HttpError(409, `${line.name} just sold out or has fewer left than you asked for`)
    }
    reserved.push(line)
  }
}

async function releaseStock(lines: Array<{ productId?: string; product?: Types.ObjectId; quantity: number }>) {
  await Promise.all(
    lines.map((line) =>
      Product.updateOne(
        { _id: line.productId ?? line.product },
        { $inc: { stock: line.quantity, salesCount: -line.quantity } },
      ),
    ),
  )
}

const createBody = z.object({
  items: cartItemsSchema.min(1, 'Your cart is empty'),
  shippingAddress: addressSchema,
  shippingMethod,
  couponCode,
  note: z.string().trim().max(500).default(''),
  saveAddress: z.boolean().default(true),
})

orders.post('/orders', requireAuth, rateLimit('order', 20, 3600), async (req, res) => {
  const body = parse(createBody, req.body)
  const user = await User.findById(currentUser(res).id)
  if (!user) throw new HttpError(401, 'Please sign in to continue')

  const quote = await buildQuote(body.items, body.shippingMethod, body.couponCode)
  if (!quote.lines.length) throw new HttpError(409, 'The items in your cart are no longer available')
  if (quote.removed.length) {
    throw new HttpError(409, `No longer available: ${quote.removed.join(', ')}. Please review your cart.`)
  }
  const shortLine = quote.lines.find((line) => {
    const asked = body.items
      .filter((item) => item.productId === line.productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    return asked > line.stock
  })
  if (shortLine) {
    throw new HttpError(409, `Only ${shortLine.stock} left of ${shortLine.name}. Please review your cart.`)
  }
  if (body.couponCode && quote.couponError) throw new HttpError(422, quote.couponError)

  await reserveStock(quote.lines)
  try {
    const order = await Order.create({
      number: orderNumber(),
      user: user._id,
      email: user.email,
      items: quote.lines.map((line) => ({
        product: new Types.ObjectId(line.productId),
        name: line.name,
        slug: line.slug,
        image: line.image,
        price: line.price,
        quantity: line.quantity,
        color: line.color,
        size: line.size,
      })),
      shippingAddress: body.shippingAddress,
      shippingMethod: body.shippingMethod,
      couponCode: quote.coupon?.code ?? '',
      subtotal: quote.subtotal,
      discount: quote.discount,
      shipping: quote.shipping,
      total: quote.total,
      note: body.note,
    })
    user.cart = []
    if (body.saveAddress) user.address = body.shippingAddress
    await user.save()
    res.status(201).json(order)
  } catch (err) {
    await releaseStock(quote.lines)
    throw err
  }
})

orders.get('/orders', requireAuth, async (_req, res) => {
  const list = await Order.find({ user: currentUser(res).id }).sort({ createdAt: -1 }).limit(100)
  res.json(list)
})

async function findOwnOrder(number: string, userId: string, role: string) {
  const order = await Order.findOne({ number: number.toUpperCase() })
  // A 404 for someone else's order avoids confirming that the number exists.
  if (!order || (String(order.user) !== userId && role !== 'admin')) {
    throw new HttpError(404, 'Order not found')
  }
  return order
}

orders.get('/orders/:number', requireAuth, async (req, res) => {
  const session = currentUser(res)
  res.json(await findOwnOrder(String(req.params.number), session.id, session.role))
})

orders.post('/orders/:number/cancel', requireAuth, async (req, res) => {
  const session = currentUser(res)
  const order = await findOwnOrder(String(req.params.number), session.id, session.role)
  if (order.status !== 'pending') {
    throw new HttpError(409, 'This order can no longer be cancelled. Please contact support.')
  }
  // The status filter makes the cancel idempotent, so stock is returned once.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: 'pending' },
    { status: 'cancelled' },
    { returnDocument: 'after' },
  )
  if (!updated) throw new HttpError(409, 'This order can no longer be cancelled.')
  await releaseStock(updated.items)
  res.json(updated)
})
