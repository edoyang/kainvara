import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth.tsx'
import { Layout } from './components/layout/Layout.tsx'
import Home from './pages/Home.tsx'

// The landing page ships in the main bundle, every other page loads on demand.
const Home2 = lazy(() => import('./pages/Home2.tsx'))
const Home3 = lazy(() => import('./pages/Home3.tsx'))
const Shop = lazy(() => import('./pages/Shop.tsx'))
const ProductPage = lazy(() => import('./pages/ProductPage.tsx'))
const Cart = lazy(() => import('./pages/Cart.tsx'))
const Checkout = lazy(() => import('./pages/Checkout.tsx'))
const OrderPage = lazy(() => import('./pages/OrderPage.tsx'))
const Account = lazy(() => import('./pages/Account.tsx'))
const Auth = lazy(() => import('./pages/Auth.tsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.tsx'))
const About = lazy(() => import('./pages/About.tsx'))
const Team = lazy(() => import('./pages/Team.tsx'))
const Contact = lazy(() => import('./pages/Contact.tsx'))
const Pricing = lazy(() => import('./pages/Pricing.tsx'))
const Blog = lazy(() => import('./pages/Blog.tsx'))
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'))
const Policies = lazy(() => import('./pages/Policies.tsx'))
const NotFound = lazy(() => import('./pages/NotFound.tsx'))
const Admin = lazy(() => import('./pages/admin/Admin.tsx'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.tsx'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.tsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.tsx'))
const AdminMessages = lazy(() =>
  import('./pages/admin/AdminInbox.tsx').then((module) => ({ default: module.AdminMessages })),
)
const AdminSubscribers = lazy(() =>
  import('./pages/admin/AdminInbox.tsx').then((module) => ({ default: module.AdminSubscribers })),
)

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="home-2" element={<Home2 />} />
        <Route path="home-3" element={<Home3 />} />

        <Route path="shop" element={<Shop />} />
        <Route path="shop/:category" element={<Shop />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />

        <Route path="login" element={<Auth key="login" mode="login" />} />
        <Route path="register" element={<Auth key="register" mode="register" />} />

        <Route
          path="checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="order/:number"
          element={
            <RequireAuth>
              <OrderPage />
            </RequireAuth>
          }
        />
        <Route
          path="account"
          element={
            <RequireAuth>
              <Account tab="profile" />
            </RequireAuth>
          }
        />
        <Route
          path="account/orders"
          element={
            <RequireAuth>
              <Account tab="orders" />
            </RequireAuth>
          }
        />
        <Route
          path="account/password"
          element={
            <RequireAuth>
              <Account tab="password" />
            </RequireAuth>
          }
        />

        <Route
          path="admin"
          element={
            <RequireAuth admin>
              <Admin />
            </RequireAuth>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
        </Route>

        <Route path="about" element={<About />} />
        <Route path="team" element={<Team />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="policies" element={<Policies />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
