import { createHash } from 'node:crypto'

// The connection string is read from whichever of these names is set, so the
// same code works with an existing .env and with the Vercel MongoDB integration.
const MONGO_URI_KEYS = [
  'MONGODB_URI',
  'MONGO_URI',
  'MONGODB_URL',
  'MONGO_URL',
  'DATABASE_URL',
  'MONGODB_CONNECTION_STRING',
  'ATLAS_URI',
  'MONGO_DB_URI',
  'DB_URI',
  'DB_URL',
]

const DEFAULT_DB_NAME = 'kainvara'

export const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

export function mongoUriKey(): string | null {
  return MONGO_URI_KEYS.find((key) => Boolean(process.env[key]?.trim())) ?? null
}

export function mongoUri(): string {
  const key = mongoUriKey()
  if (!key) {
    throw new Error(`MongoDB connection string is missing. Set one of: ${MONGO_URI_KEYS.join(', ')}`)
  }
  return process.env[key]!.trim()
}

// Atlas connection strings often have no database in the path, which would
// silently put everything in a database called "test".
export function mongoDbName(): string | undefined {
  const explicit = process.env.MONGODB_DB?.trim() || process.env.MONGO_DB_NAME?.trim()
  if (explicit) return explicit
  const path = mongoUri().replace(/^mongodb(\+srv)?:\/\//, '').split('?')[0].split('/')[1]
  return path ? undefined : DEFAULT_DB_NAME
}

// JWT_SECRET should be set in production. Without it the secret is derived
// from the connection string, which is stable across serverless instances and
// never leaves the server.
export function jwtSecret(): string {
  const explicit = process.env.JWT_SECRET?.trim()
  if (explicit) return explicit
  return createHash('sha256').update(`kainvara-jwt:${mongoUri()}`).digest('hex')
}

export function cronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null
}

export function adminSeed(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  return email && password ? { email, password } : null
}

export function stripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null
}
