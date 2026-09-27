const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function money(cents: number): string {
  return currency.format(cents / 100)
}

export function formatDate(value: string | Date): string {
  return longDate.format(new Date(value))
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function discountPercent(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

// Unsplash serves any size on request, so each slot asks for what it shows.
export function img(url: string, width: number, height?: number): string {
  if (!url.startsWith('https://images.unsplash.com/')) return url
  const base = url.split('?')[0]
  const size = height ? `w=${width}&h=${height}` : `w=${width}`
  return `${base}?auto=format&fit=crop&${size}&q=75`
}

export function imgSet(url: string, width: number, height?: number): string | undefined {
  if (!url.startsWith('https://images.unsplash.com/')) return undefined
  return `${img(url, width, height)} 1x, ${img(url, width * 2, height ? height * 2 : undefined)} 2x`
}

export function seasonLabel(date = new Date()): string {
  const month = date.getMonth()
  const season = month < 2 || month === 11 ? 'WINTER' : month < 5 ? 'SPRING' : month < 8 ? 'SUMMER' : 'AUTUMN'
  return `${season} ${date.getFullYear()}`
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
