export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export interface Category extends CategoryRef {
  description: string
  image: string
  order: number
  productCount: number
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  slug: string
  department: string
  category: CategoryRef
  summary: string
  description: string
  highlights: string[]
  // All money values are in cents.
  price: number
  compareAtPrice: number | null
  images: string[]
  colors: ProductColor[]
  sizes: string[]
  stock: number
  rating: number
  reviewCount: number
  salesCount: number
  tags: string[]
  featured: boolean
  bestseller: boolean
  active: boolean
  createdAt: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pages: number
  limit: number
}

export interface Facets {
  colors: Array<ProductColor & { count: number }>
  minPrice: number
  maxPrice: number
}

export interface Review {
  id: string
  userName: string
  rating: number
  title: string
  comment: string
  createdAt: string
}

export interface Address {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  address: Address | null
}

export interface CartItemInput {
  productId: string
  quantity: number
  color: string
  size: string
}

export interface CartLine extends CartItemInput {
  slug: string
  name: string
  department: string
  image: string
  price: number
  compareAtPrice: number | null
  stock: number
  lineTotal: number
}

export type ShippingMethodId = 'standard' | 'express'

export interface ShippingMethod {
  id: ShippingMethodId
  label: string
  eta: string
  price: number
  freeOver: number | null
}

export interface Quote {
  lines: CartLine[]
  removed: string[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon: { code: string; percentOff: number; description: string } | null
  couponError: string | null
  shippingMethod: ShippingMethodId
}

export interface PaymentConfig {
  provider: 'none' | 'stripe'
  enabled: boolean
  // Test mode takes no real money, the payment page accepts Stripe's test cards.
  mode: 'test' | 'live' | null
}

// The payment page to send the shopper to, or paid when Stripe already has the money.
export type CheckoutStart = { paid: false; url: string } | { paid: true; url: null }

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'

export interface OrderItem {
  product: string
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  color: string
  size: string
}

export interface Order {
  id: string
  number: string
  email: string
  items: OrderItem[]
  shippingAddress: Address
  shippingMethod: ShippingMethodId
  couponCode: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  status: OrderStatus
  payment: { provider: 'none' | 'stripe'; status: PaymentStatus; paidAt: string | null }
  note: string
  createdAt: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body?: string[]
  image: string
  tags: string[]
  author: string
  badge: string
  commentCount: number
  publishedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export interface Subscriber {
  id: string
  email: string
  createdAt: string
}

export interface AdminStats {
  products: number
  lowStock: number
  customers: number
  subscribers: number
  unreadMessages: number
  orders: number
  revenue: number
  byStatus: Partial<Record<OrderStatus, number>>
  recentOrders: Order[]
}
