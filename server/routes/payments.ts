import express, { Router, type Request } from 'express'
import type Stripe from 'stripe'
import { z } from 'zod'
import { currentUser, requireAuth } from '../auth.js'
import { siteUrl, stripeMode, stripeWebhookSecret } from '../env.js'
import { HttpError, parse, rateLimit } from '../http.js'
import { Order } from '../models/Order.js'
import {
  markPaymentFailed,
  paymentsEnabled,
  settleSession,
  startCheckout,
  stripe,
  syncPayment,
} from '../payments.js'

export const payments = Router()

const orderBody = z.object({ orderNumber: z.string().trim().min(1).max(20) })

payments.get('/payments/config', (_req, res) => {
  const enabled = paymentsEnabled()
  res.json({ provider: enabled ? 'stripe' : 'none', enabled, mode: enabled ? stripeMode() : null })
})

// Only the shopper who placed an order can pay for it.
async function ownOrder(number: string, userId: string) {
  const order = await Order.findOne({ number: number.toUpperCase() })
  if (!order || String(order.user) !== userId) throw new HttpError(404, 'Order not found')
  return order
}

// Where Stripe sends the shopper back to. The address of the page that made
// the request is used when it is this site, so local development and preview
// deployments return to themselves.
function returnBase(req: Request): string {
  const origin = req.get('origin')
  const host = req.get('x-forwarded-host') ?? req.get('host')
  if (origin && host) {
    try {
      if (new URL(origin).host === host) return origin
    } catch {
      // Not an address, the public one is used.
    }
  }
  return siteUrl()
}

payments.post('/payments/checkout-session', requireAuth, rateLimit('pay', 30, 3600), async (req, res) => {
  const body = parse(orderBody, req.body)
  const order = await ownOrder(body.orderNumber, currentUser(res).id)
  res.json(await startCheckout(order, returnBase(req)))
})

payments.post('/payments/confirm', requireAuth, rateLimit('pay-check', 60, 3600), async (req, res) => {
  const body = parse(orderBody, req.body)
  const order = await ownOrder(body.orderNumber, currentUser(res).id)
  res.json(await syncPayment(order))
})

// Called by Stripe, not by the site. The signature is checked against the
// exact bytes that were sent, which is why app.ts keeps the JSON parser away
// from this route.
payments.post('/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const secret = stripeWebhookSecret()
  if (!secret || !paymentsEnabled()) throw new HttpError(503, 'The payment webhook is not set up')

  const signature = req.get('stripe-signature')
  if (!signature || !Buffer.isBuffer(req.body)) throw new HttpError(400, 'The request is not signed')

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(req.body, signature, secret)
  } catch {
    throw new HttpError(400, 'The signature is not valid')
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await settleSession(event.data.object)
      break
    case 'checkout.session.async_payment_failed':
      await markPaymentFailed(event.data.object)
      break
    default:
      // Other events are acknowledged so Stripe does not send them again.
      break
  }
  res.json({ received: true })
})
