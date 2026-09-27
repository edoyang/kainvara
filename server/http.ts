import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { RateLimit } from './models/misc.js'

export class HttpError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

// Validates untrusted input and turns zod issues into a 400 with per-field messages.
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const fields: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form'
    fields[key] ??= issue.message
  }
  throw new HttpError(400, Object.values(fields)[0] ?? 'Invalid request', fields)
}

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export function clientIp(req: Request): string {
  const forwarded = req.headers['x-real-ip'] ?? req.headers['x-forwarded-for']
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return value?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
}

// Fixed-window limiter backed by Mongo, so it holds across serverless instances.
export function rateLimit(name: string, limit: number, windowSeconds: number) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const windowMs = windowSeconds * 1000
    const bucket = Math.floor(Date.now() / windowMs)
    const key = `${name}:${clientIp(req)}:${bucket}`
    const entry = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * windowMs) } },
      { upsert: true, returnDocument: 'after' },
    )
    if (entry && entry.count > limit) {
      throw new HttpError(429, 'Too many attempts. Please wait a moment and try again.')
    }
    next()
  }
}

export function notFound(_req: Request, _res: Response) {
  throw new HttpError(404, 'Not found')
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, fields: err.fields })
    return
  }
  const known = err as { name?: string; code?: number; type?: string; status?: number }
  if (known.type === 'entity.parse.failed' || known.type === 'entity.too.large') {
    res.status(known.status ?? 400).json({ error: 'Invalid request body' })
    return
  }
  if (known.name === 'CastError' || known.name === 'ValidationError') {
    res.status(400).json({ error: 'Invalid request' })
    return
  }
  if (known.code === 11000) {
    res.status(409).json({ error: 'That already exists' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}
