import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { isProd, jwtSecret } from './env.js'
import { HttpError } from './http.js'
import { User, type UserRole } from './models/User.js'

const SESSION_COOKIE = 'kainvara_session'
const SESSION_DAYS = 7

export interface AuthUser {
  id: string
  role: UserRole
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function cookieOptions() {
  return { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' }
}

// The session lives in an httpOnly cookie so page scripts can never read the token.
export function startSession(res: Response, user: AuthUser) {
  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret(), {
    algorithm: 'HS256',
    expiresIn: `${SESSION_DAYS}d`,
  })
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 })
}

export function endSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions())
}

function readSession(req: Request): AuthUser | null {
  const token: unknown = req.cookies?.[SESSION_COOKIE]
  if (typeof token !== 'string' || !token) return null
  try {
    const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] })
    if (typeof payload === 'string' || typeof payload.sub !== 'string') return null
    return { id: payload.sub, role: payload.role === 'admin' ? 'admin' : 'customer' }
  } catch {
    return null
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  res.locals.user = readSession(req)
  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = readSession(req)
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  res.locals.user = user
  next()
}

// The role is re-read from the database, so a demoted admin loses access
// immediately instead of when their token expires.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req)
  if (!session) throw new HttpError(401, 'Please sign in to continue')
  const user = await User.findById(session.id).select('role')
  if (!user || user.role !== 'admin') throw new HttpError(403, 'Admin access only')
  res.locals.user = { id: session.id, role: 'admin' } satisfies AuthUser
  next()
}

export function sessionUser(res: Response): AuthUser | null {
  return (res.locals.user as AuthUser | null | undefined) ?? null
}

export function currentUser(res: Response): AuthUser {
  const user = sessionUser(res)
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  return user
}
