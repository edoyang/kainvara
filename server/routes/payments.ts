import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { stripeSecretKey } from '../env.js'
import { HttpError } from '../http.js'

export const payments = Router()

// Payment is the final phase of the project. Orders are created unpaid
// (order.payment.provider = 'none') and these two endpoints are the only
// places that need to change when Stripe is added:
//   1. POST /payments/checkout-session creates a Stripe Checkout Session for
//      an order and stores session.id in order.payment.stripeSessionId.
//   2. POST /payments/webhook verifies the Stripe signature (it needs the raw
//      body, see app.ts) and marks the order paid on checkout.session.completed.

payments.get('/payments/config', (_req, res) => {
  res.json({ provider: stripeSecretKey() ? 'stripe' : 'none', enabled: Boolean(stripeSecretKey()) })
})

payments.post('/payments/checkout-session', requireAuth, () => {
  throw new HttpError(501, 'Online payment is not enabled yet')
})

payments.post('/payments/webhook', () => {
  throw new HttpError(501, 'Online payment is not enabled yet')
})
