import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageTitle, site } from '../lib/site.ts'

type JsonLd = Record<string, unknown>

interface SeoProps {
  // Page name without the brand. Leave out on the home page.
  title?: string
  description?: string
  // Canonical path. Defaults to the current path without its query string.
  path?: string
  // Share image, a full address or a path on this site.
  image?: string
  type?: 'website' | 'article' | 'product'
  // Private or throwaway pages (cart, account, search results) stay out of search.
  noindex?: boolean
  jsonLd?: JsonLd | JsonLd[]
}

const JSON_LD_ID = 'page-structured-data'

function absolute(value: string): string {
  return value.startsWith('http') ? value : `${site.url}${value.startsWith('/') ? '' : '/'}${value}`
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

// index.html carries the default tags for crawlers that do not run scripts.
// This keeps the same tags up to date for each page, so there is only ever
// one description, one canonical link and one set of share tags in the head.
export function Seo({ title, description, path, image, type = 'website', noindex, jsonLd }: SeoProps) {
  const location = useLocation()
  const fullTitle = pageTitle(title)
  const summary = description ?? site.description
  const canonical = absolute(path ?? location.pathname)
  const shareImage = absolute(image ?? site.shareImage)
  const structured = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    setMeta('name', 'description', summary)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setCanonical(canonical)

    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', summary)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', shareImage)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', summary)
    setMeta('name', 'twitter:image', shareImage)

    const existing = document.getElementById(JSON_LD_ID)
    if (!structured) {
      existing?.remove()
      return
    }
    const script = existing ?? document.createElement('script')
    script.id = JSON_LD_ID
    script.setAttribute('type', 'application/ld+json')
    // textContent, never innerHTML: product and post names come from the database.
    script.textContent = structured
    if (!existing) document.head.appendChild(script)
  }, [fullTitle, summary, canonical, shareImage, type, noindex, structured])

  return <title>{fullTitle}</title>
}
