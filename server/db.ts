import mongoose from 'mongoose'
import { mongoDbName, mongoUri } from './env.js'

interface ConnectionCache {
  promise: Promise<typeof mongoose> | null
}

// Cached on globalThis so warm serverless invocations (and dev reloads) reuse
// one connection instead of opening a new pool per request.
const globalCache = globalThis as typeof globalThis & { __mongooseCache?: ConnectionCache }
const cache: ConnectionCache = (globalCache.__mongooseCache ??= { promise: null })

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.promise && mongoose.connection.readyState === 0) cache.promise = null

  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose
      .connect(mongoUri(), {
        dbName: mongoDbName(),
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10_000,
      })
      .catch((err: unknown) => {
        cache.promise = null
        throw err
      })
  }
  return cache.promise
}

export async function pingDb(): Promise<number> {
  await connectDb()
  const started = Date.now()
  await mongoose.connection.db!.command({ ping: 1 })
  return Date.now() - started
}
