import { Router } from 'express'
import { z } from 'zod'
import {
  currentUser,
  endSession,
  hashPassword,
  optionalAuth,
  requireAuth,
  sessionUser,
  startSession,
  verifyPassword,
} from '../auth.js'
import { HttpError, parse, rateLimit } from '../http.js'
import { User } from '../models/User.js'

export const auth = Router()

const email = z.email('Enter a valid email address').max(254).transform((value) => value.toLowerCase())
const password = z.string().min(8, 'Use at least 8 characters').max(128)
const name = z.string().trim().min(2, 'Enter your name').max(80)

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient name').max(80),
  phone: z.string().trim().min(5, 'Enter a phone number').max(30),
  line1: z.string().trim().min(3, 'Enter the street address').max(120),
  line2: z.string().trim().max(120).default(''),
  city: z.string().trim().min(2, 'Enter the city').max(80),
  state: z.string().trim().max(80).default(''),
  postalCode: z.string().trim().min(2, 'Enter the postal code').max(20),
  country: z.string().trim().min(2, 'Enter the country').max(80),
})

auth.post('/auth/register', rateLimit('register', 10, 3600), async (req, res) => {
  const body = parse(z.object({ name, email, password }), req.body)
  if (await User.exists({ email: body.email })) {
    throw new HttpError(409, 'An account with that email already exists', {
      email: 'An account with that email already exists',
    })
  }
  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await hashPassword(body.password),
  })
  startSession(res, { id: user.id as string, role: user.role })
  res.status(201).json(user)
})

auth.post('/auth/login', rateLimit('login', 10, 600), async (req, res) => {
  const body = parse(z.object({ email, password: z.string().min(1, 'Enter your password').max(128) }), req.body)
  const user = await User.findOne({ email: body.email })
  // Same message for both cases so the form cannot be used to discover accounts.
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect')
  }
  startSession(res, { id: user.id as string, role: user.role })
  res.json(user)
})

auth.post('/auth/logout', (_req, res) => {
  endSession(res)
  res.json({ ok: true })
})

auth.get('/auth/me', optionalAuth, async (_req, res) => {
  const session = sessionUser(res)
  const user = session ? await User.findById(session.id) : null
  if (session && !user) endSession(res)
  res.json(user)
})

auth.put('/auth/profile', requireAuth, async (req, res) => {
  const body = parse(z.object({ name, address: addressSchema.nullable().optional() }), req.body)
  const user = await User.findById(currentUser(res).id)
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  user.name = body.name
  if (body.address !== undefined) user.address = body.address
  await user.save()
  res.json(user)
})

auth.put('/auth/password', requireAuth, rateLimit('password', 10, 600), async (req, res) => {
  const body = parse(z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }), req.body)
  const user = await User.findById(currentUser(res).id)
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'Current password is incorrect', {
      currentPassword: 'Current password is incorrect',
    })
  }
  user.passwordHash = await hashPassword(body.newPassword)
  await user.save()
  res.json({ ok: true })
})
