import { Router } from 'express'
import { z } from 'zod'
import { HttpError, parse, rateLimit } from '../http.js'
import { Message, Subscriber } from '../models/misc.js'
import { Post } from '../models/Post.js'

export const content = Router()

const email = z.email('Enter a valid email address').max(254).transform((value) => value.toLowerCase())

content.get('/posts', async (req, res) => {
  const query = parse(
    z.object({
      page: z.coerce.number().int().min(1).max(200).default(1),
      limit: z.coerce.number().int().min(1).max(24).default(6),
    }),
    req.query,
  )
  const total = await Post.countDocuments()
  const pages = Math.max(1, Math.ceil(total / query.limit))
  const page = Math.min(query.page, pages)
  const items = await Post.find()
    .sort({ publishedAt: -1, _id: 1 })
    .skip((page - 1) * query.limit)
    .limit(query.limit)
    .select('-body')
  res.json({ items, total, page, pages, limit: query.limit })
})

content.get('/posts/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug.toLowerCase() })
  if (!post) throw new HttpError(404, 'Post not found')
  const more = await Post.find({ _id: { $ne: post._id } })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('-body')
  res.json({ post, more })
})

content.post('/newsletter', rateLimit('newsletter', 10, 3600), async (req, res) => {
  const body = parse(z.object({ email }), req.body)
  // Upsert keeps the response identical for new and existing subscribers.
  await Subscriber.updateOne({ email: body.email }, { $setOnInsert: { email: body.email } }, { upsert: true })
  res.status(201).json({ ok: true })
})

content.post('/contact', rateLimit('contact', 5, 3600), async (req, res) => {
  const body = parse(
    z.object({
      name: z.string().trim().min(2, 'Enter your name').max(80),
      email,
      subject: z.string().trim().max(120).default(''),
      message: z.string().trim().min(10, 'Tell us a little more').max(2000),
    }),
    req.body,
  )
  await Message.create(body)
  res.status(201).json({ ok: true })
})
