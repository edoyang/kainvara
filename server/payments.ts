import type { HydratedDocument } from 'mongoose'
import Stripe from 'stripe'
import { stripeSecretKey } from './env.js'
import { HttpError, objectId } from './http.js'
import { Order, type IOrder, type PaymentStatus } from './models/Order.js'
import { SHIPPING_METHODS } from './pricing.js'

type OrderDoc = HydratedDocument<IOrder>

const CURRENCY = 'usd'
const SETTLED: PaymentStatus[] = ['paid', 'refunded']
// The smallest amount Stripe will charge in US dollars.
const MINIMUM_CHARGE = 50
// How long a payment page stays open. Stripe allows 30 minutes to 24 hours.
const CHECKOUT_MINUTES = 60

let client: Stripe | null = null
let clientKey = ''

export function paymentsEnabled(): boolean {
  return stripeSecretKey() !== null
}

export function stripe(): Stripe {
  const key = stripeSecretKey()
  if (!key) throw new HttpError(503, 'Card payment is not switched on')
  if (!client || clientKey !== key) {
    client = new Stripe(key, { maxNetworkRetries: 2, timeout: 20_000, appInfo: { name: 'Kainvara' } })
    clientKey = key
  }
  return client
}

// Stripe errors are logged for the owner and never shown to the shopper as they are.
function unreachable(err: unknown): HttpError {
  if (err instanceof HttpError) return err
  const detail = err instanceof Stripe.errors.StripeError ? `${err.type} ${err.code ?? ''} ${err.message}` : err
  console.error('Stripe request failed:', detail)
  return new HttpError(502, 'The payment service could not be reached. Please try again in a moment.')
}

async function ask<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call()
  } catch (err) {
    throw unreachable(err)
  }
}

// A session id from another Stripe account or mode (after a key change) is
// treated as no session at all.
async function findSession(id: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe().checkout.sessions.retrieve(id)
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') return null
    throw unreachable(err)
  }
}

function photos(source: string): string[] {
  if (!source.startsWith('https://')) return []
  const sized = source.startsWith('https://images.unsplash.com/')
    ? `${source.split('?')[0]}?auto=format&fit=crop&w=400&h=400&q=75`
    : source
  return sized.length <= 2048 ? [sized] : []
}

function paymentLines(order: OrderDoc): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return order.items.map((item) => {
    const options = [item.color, item.size && `Size ${item.size}`].filter(Boolean).join(', ')
    return {
      quantity: item.quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: item.price,
        product_data: {
          name: item.name,
          ...(options ? { description: options } : {}),
          images: photos(item.image),
        },
      },
    }
  })
}

// The amounts come from the stored order, which was priced from the database
// when it was placed. Nothing sent by the browser is used here.
async function createSession(order: OrderDoc, base: string): Promise<Stripe.Checkout.Session> {
  const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60
  const metadata = { orderId: order.id as string, orderNumber: order.number }
  const page = `${base}/order/${order.number}`

  const shared: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    client_reference_id: order.number,
    customer_email: order.email,
    metadata,
    payment_intent_data: { description: `Kainvara order ${order.number}`, metadata },
    success_url: `${page}?payment=success`,
    cancel_url: `${page}?payment=cancelled`,
    expires_at: expiresAt,
  }

  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
  if (order.discount > 0) {
    const coupon = await stripe().coupons.create({
      amount_off: order.discount,
      currency: CURRENCY,
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expiresAt + 300,
      name: (order.couponCode ? `Code ${order.couponCode}` : 'Discount').slice(0, 40),
      metadata,
    })
    discounts.push({ coupon: coupon.id })
  }

  const session = await stripe().checkout.sessions.create({
    ...shared,
    line_items: paymentLines(order),
    ...(discounts.length ? { discounts } : {}),
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: SHIPPING_METHODS[order.shippingMethod].label,
          fixed_amount: { amount: order.shipping, currency: CURRENCY },
        },
      },
    ],
  })
  if (session.amount_total === order.total) return session

  // Should never happen. If Stripe adds the lines up differently, the shopper
  // is charged the order total as one line instead of a wrong amount.
  console.error(`Stripe total ${session.amount_total} differs from order ${order.number} total ${order.total}`)
  await stripe().checkout.sessions.expire(session.id)
  return stripe().checkout.sessions.create({
    ...shared,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: order.total,
          product_data: { name: `Kainvara order ${order.number}` },
        },
      },
    ],
  })
}

export type Checkout = { paid: false; url: string } | { paid: true; url: null }

// Opens the payment page for an order, or returns the one that is still open.
export async function startCheckout(order: OrderDoc, base: string): Promise<Checkout> {
  if (order.status !== 'pending' || order.payment.status === 'paid') {
    throw new HttpError(409, 'This order is not waiting for payment')
  }
  if (order.total < MINIMUM_CHARGE) {
    throw new HttpError(422, 'This order is below the smallest amount a card can be charged')
  }

  if (order.payment.stripeSessionId) {
    const existing = await findSession(order.payment.stripeSessionId)
    if (existing?.payment_status === 'paid') {
      await settleSession(existing)
      return { paid: true, url: null }
    }
    if (existing?.status === 'open' && existing.url) return { paid: false, url: existing.url }
  }

  const session = await ask(() => createSession(order, base))
  if (!session.url) throw new HttpError(502, 'The payment page could not be opened. Please try again.')
  await Order.updateOne(
    { _id: order._id },
    { $set: { 'payment.provider': 'stripe', 'payment.stripeSessionId': session.id } },
  )
  return { paid: false, url: session.url }
}

// Records a payment. The session must come from Stripe itself: either from a
// webhook with a checked signature, or fetched with the secret key.
export async function settleSession(session: Stripe.Checkout.Session): Promise<OrderDoc | null> {
  if (session.payment_status !== 'paid') return null
  const orderId = session.metadata?.orderId ?? ''
  if (!objectId.safeParse(orderId).success) return null

  const order = await Order.findById(orderId)
  if (!order) return null
  if (order.payment.status === 'paid' || order.payment.status === 'refunded') return order
  if (session.amount_total !== order.total || session.currency !== CURRENCY) {
    console.error(`Payment ${session.id} does not match the total of order ${order.number}`)
    return order
  }

  const paymentIntent =
    typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? '')
  const payment = {
    'payment.provider': 'stripe' as const,
    'payment.status': 'paid' as const,
    'payment.stripeSessionId': session.id,
    'payment.stripePaymentIntentId': paymentIntent,
    'payment.paidAt': new Date(),
  }
  // The filters make this safe to run twice, the webhook and the shopper
  // coming back from Stripe often arrive at the same moment.
  const paid = await Order.findOneAndUpdate(
    { _id: order._id, status: 'pending', 'payment.status': { $nin: SETTLED } },
    { $set: { ...payment, status: 'paid' as const } },
    { returnDocument: 'after' },
  )
  if (paid) return paid

  // No longer pending: the payment is recorded and the status is left alone.
  const late = await Order.findOneAndUpdate(
    { _id: order._id, 'payment.status': { $nin: SETTLED } },
    { $set: payment },
    { returnDocument: 'after' },
  )
  if (!late) return Order.findById(order._id)
  if (late.status !== 'cancelled' || !paymentIntent) return late

  // Cancelled while the payment page was open. The stock has already gone
  // back on sale, so the money is returned.
  try {
    await stripe().refunds.create({
      payment_intent: paymentIntent,
      reason: 'requested_by_customer',
      metadata: { orderNumber: late.number },
    })
    late.payment.status = 'refunded'
    await late.save()
  } catch (err) {
    console.error(`Refund for cancelled order ${late.number} failed, refund it from the Stripe dashboard:`, err)
  }
  return late
}

// Asks Stripe whether the order has been paid. Used when the shopper comes
// back from the payment page, so the order is right even before the webhook.
export async function syncPayment(order: OrderDoc): Promise<OrderDoc> {
  if (order.payment.status === 'paid' || !order.payment.stripeSessionId || !paymentsEnabled()) return order
  const session = await findSession(order.payment.stripeSessionId)
  if (!session) return order
  return (await settleSession(session)) ?? order
}

// Run before an order is cancelled, so that a payment page which is still
// open cannot be paid afterwards.
export async function closeCheckout(order: OrderDoc): Promise<void> {
  const sessionId = order.payment.stripeSessionId
  if (!sessionId || !paymentsEnabled()) return
  const session = await findSession(sessionId)
  if (!session) return
  if (session.payment_status === 'paid') {
    await settleSession(session)
    throw new HttpError(409, 'This order has been paid and can no longer be cancelled. Please contact support.')
  }
  if (session.status === 'open') await ask(() => stripe().checkout.sessions.expire(sessionId))
}

export async function markPaymentFailed(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId ?? ''
  if (!objectId.safeParse(orderId).success) return
  await Order.updateOne(
    { _id: orderId, 'payment.stripeSessionId': session.id, 'payment.status': 'unpaid' },
    { $set: { 'payment.status': 'failed' } },
  )
}
