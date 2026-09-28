import type { Post, Product } from '../types.ts'
import { img } from './format.ts'
import { site } from './site.ts'

// schema.org data for search results: price and rating on products, author
// and date on posts, and the path to each page as a breadcrumb trail.

interface Crumb {
  name: string
  path: string
}

export function breadcrumbData(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  }
}

export function productData(product: Product) {
  const url = `${site.url}/product/${product.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    image: product.images.map((image) => img(image, 1200, 1200)),
    sku: `KV-${product.id.slice(-8).toUpperCase()}`,
    category: product.category.name,
    brand: { '@type': 'Brand', name: site.name },
    url,
    ...(product.colors.length ? { color: product.colors.map((color) => color.name).join(', ') } : {}),
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: site.name },
    },
  }
}

export function articleData(post: Post) {
  const url = `${site.url}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [img(post.image, 1200, 630)],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png` },
    },
    mainEntityOfPage: url,
    url,
  }
}
