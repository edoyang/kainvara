import { timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { pingDb } from '../db.js'
import { cronSecret } from '../env.js'
import { HttpError } from '../http.js'
import { Heartbeat } from '../models/misc.js'
import { Product } from '../models/Product.js'

export const system = Router()

const HEARTBEAT_KEY = 'keepalive'

system.get('/health', async (_req, res) => {
  const latencyMs = await pingDb()
  const heartbeat = await Heartbeat.findOne({ key: HEARTBEAT_KEY })
  res.json({
    ok: true,
    database: { connected: true, latencyMs },
    lastKeepAlive: heartbeat?.lastPingAt ?? null,
    keepAliveCount: heartbeat?.count ?? 0,
    time: new Date().toISOString(),
  })
})

function authorized(header: string | undefined): boolean {
  const secret = cronSecret()
  // Without CRON_SECRET the job stays open: it only records a timestamp.
  if (!secret) return true
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header ?? '')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

// Free Atlas clusters are paused after a long stretch with no activity. This
// endpoint is hit on a schedule (vercel.json crons + GitHub Actions) and does a
// real read and write, so the cluster always has recent traffic.
system.get('/cron/keepalive', async (req, res) => {
  if (!authorized(req.headers.authorization)) throw new HttpError(401, 'Unauthorized')

  const latencyMs = await pingDb()
  const source = String(req.headers['user-agent'] ?? '').slice(0, 80)
  const [heartbeat, products] = await Promise.all([
    Heartbeat.findOneAndUpdate(
      { key: HEARTBEAT_KEY },
      { $set: { lastPingAt: new Date(), source }, $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' },
    ),
    Product.estimatedDocumentCount(),
  ])

  res.setHeader('Cache-Control', 'no-store')
  res.json({
    ok: true,
    latencyMs,
    products,
    count: heartbeat?.count ?? 1,
    lastPingAt: heartbeat?.lastPingAt ?? null,
  })
})
