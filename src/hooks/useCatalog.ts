import { api, withQuery } from '../lib/api.ts'
import type { Category, Paged, Post, Product } from '../types.ts'
import { useQuery } from './useQuery.ts'

export interface ProductFilters {
  category?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
  color?: string
  featured?: boolean
  bestseller?: boolean
  sale?: boolean
}

export function useCategories() {
  return useQuery('categories', (signal) => api<Category[]>('/categories', { signal }))
}

export function useProducts(filters: ProductFilters) {
  const path = withQuery('/products', {
    ...filters,
    featured: filters.featured ? 1 : undefined,
    bestseller: filters.bestseller ? 1 : undefined,
    sale: filters.sale ? 1 : undefined,
  })
  return useQuery(path, (signal) => api<Paged<Product>>(path, { signal }), { keepPrevious: true })
}

export function usePosts(limit: number, page = 1) {
  const path = withQuery('/posts', { limit, page })
  return useQuery(path, (signal) => api<Paged<Post>>(path, { signal }))
}
