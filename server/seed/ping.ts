// npm run db:ping
// Same read and write as the scheduled keep-alive, run by hand.
import mongoose from 'mongoose'
import { pingDb } from '../db.js'
import { mongoUriKey } from '../env.js'
import { Heartbeat } from '../models/misc.js'
import { Product } from '../models/Product.js'

try {
  console.log(`Connection string variable: ${mongoUriKey() ?? 'not set'}`)
  const latencyMs = await pingDb()
  const heartbeat = await Heartbeat.findOneAndUpdate(
    { key: 'keepalive' },
    { $set: { lastPingAt: new Date(), source: 'npm run db:ping' }, $inc: { count: 1 } },
    { upsert: true, returnDocument: 'after' },
  )
  console.table({
    database: mongoose.connection.name,
    latencyMs,
    products: await Product.estimatedDocumentCount(),
    keepAliveCount: heartbeat?.count ?? 0,
    lastPingAt: heartbeat?.lastPingAt.toISOString() ?? '',
  })
} catch (err) {
  console.error('Ping failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
