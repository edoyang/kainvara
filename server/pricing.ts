import { z } from 'zod'
import { HttpError, objectId } from './http.js'
import { Coupon } from './models/misc.js'
import { Product } from './models/Product.js'

export const SHIPPING_METHODS = {
  standard: { label: 'Standard delivery', eta: '3 to 5 business days', price: 499, freeOver: 5000 },
  express: { label: 'Express delivery', eta: '1 to 2 business days', price: 1499, freeOver: null },
} as const

export type ShippingMethod = keyof typeof SHIPPING_METHODS

export const cartItemsSchema = z
  .array(
    z.object({
      productId: objectId,
      quantity: z.coerce.number().int().min(1).max(99),
      color: z.string().max(40).default(''),
      size: z.string().max(20).default(''),
    }),
  )
  .max(50)

export type CartItemInput = z.infer<typeof cartItemsSchema>[number]

export interface CartLine {
  productId: string
  slug: string
  name: string
  department: string
  image: string
  price: number
  compareAtPrice: number | null
  stock: number
  quantity: number
  color: string
  size: string
  lineTotal: number
}

export interface Quote {
  lines: CartLine[]
  // Items that could not be kept (deleted or out of stock), so the UI can explain why.
  removed: string[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon: { code: string; percentOff: number; description: string } | null
  couponError: string | null
  shippingMethod: ShippingMethod
}

// Prices always come from the database, never from the client.
export async function resolveLines(items: CartItemInput[]): Promise<{ lines: CartLine[]; removed: string[] }> {
  const ids = [...new Set(items.map((item) => item.productId))]
  const products = await Product.find({ _id: { $in: ids }, active: true })
  const byId = new Map(products.map((product) => [product.id as string, product]))

  const lines: CartLine[] = []
  const removed: string[] = []
  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product || product.stock < 1) {
      removed.push(product?.name ?? 'An item that is no longer available')
      continue
    }
    const quantity = Math.min(item.quantity, product.stock)
    const color = product.colors.some((c) => c.name === item.color) ? item.color : (product.colors[0]?.name ?? '')
    const size = product.sizes.includes(item.size) ? item.size : (product.sizes[0] ?? '')
    const existing = lines.find((l) => l.productId === item.productId && l.color === color && l.size === size)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock)
      existing.lineTotal = existing.quantity * existing.price
      continue
    }
    lines.push({
      productId: item.productId,
      slug: product.slug,
      name: product.name,
      department: product.department,
      image: product.images[0] ?? '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      quantity,
      color,
      size,
      lineTotal: quantity * product.price,
    })
  }
  return { lines, removed }
}

export async function findCoupon(code: string, subtotal: number) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true })
  if (!coupon) throw new HttpError(404, 'That code is not valid')
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new HttpError(410, 'That code has expired')
  }
  if (subtotal < coupon.minSubtotal) {
    throw new HttpError(422, `Spend $${(coupon.minSubtotal / 100).toFixed(2)} or more to use this code`)
  }
  return coupon
}

export async function buildQuote(
  items: CartItemInput[],
  shippingMethod: ShippingMethod,
  couponCode: string,
): Promise<Quote> {
  const { lines, removed } = await resolveLines(items)
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  let coupon: Quote['coupon'] = null
  let couponError: string | null = null
  if (couponCode.trim() && lines.length) {
    try {
      const found = await findCoupon(couponCode, subtotal)
      coupon = { code: found.code, percentOff: found.percentOff, description: found.description }
    } catch (err) {
      if (!(err instanceof HttpError)) throw err
      couponError = err.message
    }
  }

  const discount = coupon ? Math.round((subtotal * coupon.percentOff) / 100) : 0
  const method = SHIPPING_METHODS[shippingMethod]
  const qualifiesFree = method.freeOver !== null && subtotal - discount >= method.freeOver
  const shipping = !lines.length || qualifiesFree ? 0 : method.price

  return {
    lines,
    removed,
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    coupon,
    couponError,
    shippingMethod,
  }
}
