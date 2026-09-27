import { Router } from 'express'
import { Types } from 'mongoose'
import { z } from 'zod'
import { currentUser, requireAuth } from '../auth.js'
import { HttpError, objectId, parse } from '../http.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { cartItemsSchema, resolveLines, type CartItemInput } from '../pricing.js'

export const account = Router()

async function loadUser(id: string) {
  const user = await User.findById(id)
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  return user
}

// Refreshes a guest cart held in the browser with current prices and stock.
account.post('/cart/resolve', async (req, res) => {
  const body = parse(z.object({ items: cartItemsSchema }), req.body)
  res.json(await resolveLines(body.items))
})

account.get('/cart', requireAuth, async (_req, res) => {
  const user = await loadUser(currentUser(res).id)
  const items: CartItemInput[] = user.cart.map((item) => ({
    productId: String(item.product),
    quantity: item.quantity,
    color: item.color,
    size: item.size,
  }))
  res.json(await resolveLines(items))
})

account.put('/cart', requireAuth, async (req, res) => {
  const body = parse(z.object({ items: cartItemsSchema }), req.body)
  const user = await loadUser(currentUser(res).id)
  const resolved = await resolveLines(body.items)
  user.cart = resolved.lines.map((line) => ({
    product: new Types.ObjectId(line.productId),
    quantity: line.quantity,
    color: line.color,
    size: line.size,
  }))
  await user.save()
  res.json(resolved)
})

async function wishlistProducts(ids: Types.ObjectId[]) {
  const products = await Product.find({ _id: { $in: ids }, active: true }).populate('category', 'name slug')
  const order = new Map(ids.map((id, index) => [String(id), index]))
  return products.sort((a, b) => (order.get(a.id as string) ?? 0) - (order.get(b.id as string) ?? 0))
}

// Used for guest wishlists, which only hold product ids in the browser.
account.post('/wishlist/resolve', async (req, res) => {
  const body = parse(z.object({ ids: z.array(objectId).max(100) }), req.body)
  res.json(await wishlistProducts(body.ids.map((id) => new Types.ObjectId(id))))
})

account.get('/wishlist', requireAuth, async (_req, res) => {
  const user = await loadUser(currentUser(res).id)
  res.json(await wishlistProducts(user.wishlist))
})

account.put('/wishlist', requireAuth, async (req, res) => {
  const body = parse(z.object({ ids: z.array(objectId).max(100) }), req.body)
  const user = await loadUser(currentUser(res).id)
  const ids = [...new Set(body.ids)].map((id) => new Types.ObjectId(id))
  const existing = await Product.find({ _id: { $in: ids } }).select('_id')
  const valid = new Set(existing.map((product) => String(product._id)))
  user.wishlist = ids.filter((id) => valid.has(String(id)))
  await user.save()
  res.json(await wishlistProducts(user.wishlist))
})
