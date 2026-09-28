import cookieParser from 'cookie-parser'
import express, { type NextFunction, type Request, type Response } from 'express'
import { connectDb } from './db.js'
import { errorHandler, HttpError, notFound } from './http.js'
import { account } from './routes/account.js'
import { admin } from './routes/admin.js'
import { auth } from './routes/auth.js'
import { catalog } from './routes/catalog.js'
import { content } from './routes/content.js'
import { orders } from './routes/orders.js'
import { payments } from './routes/payments.js'
import { seo } from './routes/seo.js'
import { system } from './routes/system.js'
import { ensureSeeded } from './seed/seed.js'

const app = express()

app.disable('x-powered-by')

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// The Stripe webhook must read the raw body to verify its signature, so it
// is the one route that skips the JSON parser.
const WEBHOOK_PATH = '/api/payments/webhook'

app.use((req, res, next) => {
  if (req.path === WEBHOOK_PATH) return next()
  express.json({ limit: '100kb' })(req, res, next)
})
app.use(cookieParser())

// Session cookies are SameSite=Lax, and requiring JSON on every write means a
// plain cross-site form post can never reach a handler.
app.use((req: Request, _res: Response, next: NextFunction) => {
  const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  if (isWrite && req.path !== WEBHOOK_PATH && !req.is('application/json')) {
    throw new HttpError(415, 'Requests must be sent as JSON')
  }
  next()
})

app.use(async (_req, _res, next) => {
  try {
    await connectDb()
    await ensureSeeded()
  } catch (err) {
    console.error('Database unavailable:', err instanceof Error ? err.message : err)
    throw new HttpError(503, 'The store is temporarily unavailable. Please try again shortly.')
  }
  next()
})

app.use('/api', system, catalog, auth, account, orders, content, payments, admin)
app.use('/api', notFound)
// Outside /api: the sitemap, and link previews for chat apps (see vercel.json).
app.use(seo)
app.use(errorHandler)

export default app
