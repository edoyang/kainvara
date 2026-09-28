import { Router, type Response } from 'express'
import { siteUrl } from '../env.js'
import { HttpError } from '../http.js'
import { Category } from '../models/Category.js'
import { Post } from '../models/Post.js'
import { Product } from '../models/Product.js'

export const seo = Router()

const STORE = 'Kainvara'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/team', priority: '0.4', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.4', changefreq: 'monthly' },
  { path: '/policies', priority: '0.3', changefreq: 'yearly' },
]

// Used for both XML and HTML output, the five characters matter in each.
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function day(value: unknown): string {
  const date = value instanceof Date ? value : new Date()
  return date.toISOString().slice(0, 10)
}

function cacheFor(res: Response, seconds: number) {
  res.setHeader('Cache-Control', `public, max-age=${seconds}, s-maxage=${seconds}`)
}

// Built from the database on request, so new products and posts are listed
// without a redeploy.
seo.get('/sitemap.xml', async (_req, res) => {
  const base = siteUrl()
  const [categories, products, posts] = await Promise.all([
    Category.find().select('slug updatedAt').sort({ order: 1 }),
    Product.find({ active: true }).select('slug updatedAt').sort({ salesCount: -1 }),
    Post.find().select('slug publishedAt').sort({ publishedAt: -1 }),
  ])

  const entries = [
    ...STATIC_PAGES.map((page) => ({ ...page, lastmod: day(new Date()) })),
    ...categories.map((category) => ({
      path: `/shop/${category.slug}`,
      priority: '0.8',
      changefreq: 'daily',
      lastmod: day(category.get('updatedAt')),
    })),
    ...products.map((product) => ({
      path: `/product/${product.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: day(product.get('updatedAt')),
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: day(post.publishedAt),
    })),
  ]

  const body = entries
    .map(
      (entry) =>
        `  <url><loc>${escape(base + entry.path)}</loc><lastmod>${entry.lastmod}</lastmod>` +
        `<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`,
    )
    .join('\n')

  cacheFor(res, 3600)
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
})

interface Preview {
  title: string
  description: string
  image: string
  url: string
  type: 'product' | 'article'
  extra?: string
}

// Chat apps and social networks do not run scripts, so a link to a product
// would show the generic store preview. vercel.json sends only those preview
// bots here (matched on their user agent). Search engines and people always
// get the real page.
function sendPreview(res: Response, preview: Preview) {
  const title = escape(preview.title)
  const description = escape(preview.description)
  const image = escape(preview.image)
  const url = escape(preview.url)

  cacheFor(res, 3600)
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:site_name" content="${STORE}" />
    <meta property="og:type" content="${preview.type}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />${preview.extra ?? ''}
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p><a href="${url}">${url}</a></p>
  </body>
</html>
`)
}

function shareImage(source: string | undefined): string {
  if (!source) return `${siteUrl()}/og-image.png`
  if (!source.startsWith('https://images.unsplash.com/')) return source
  return `${source.split('?')[0]}?auto=format&fit=crop&w=1200&h=630&q=75`
}

seo.get('/product/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug.toLowerCase(), active: true })
  if (!product) throw new HttpError(404, 'Product not found')
  const price = (product.price / 100).toFixed(2)
  sendPreview(res, {
    title: `${product.name} | ${STORE}`,
    description: `${product.summary} $${price} at ${STORE}, with free delivery over $50 and 30 day returns.`,
    image: shareImage(product.images[0]),
    url: `${siteUrl()}/product/${product.slug}`,
    type: 'product',
    extra: `
    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="USD" />
    <meta property="product:availability" content="${product.stock > 0 ? 'in stock' : 'out of stock'}" />`,
  })
})

seo.get('/blog/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug.toLowerCase() })
  if (!post) throw new HttpError(404, 'Post not found')
  sendPreview(res, {
    title: `${post.title} | ${STORE}`,
    description: post.excerpt,
    image: shareImage(post.image),
    url: `${siteUrl()}/blog/${post.slug}`,
    type: 'article',
    extra: `
    <meta property="article:published_time" content="${escape(post.publishedAt.toISOString())}" />
    <meta property="article:author" content="${escape(post.author)}" />`,
  })
})
