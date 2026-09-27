# Kainvara

A full stack fashion store: React storefront, Express API, MongoDB, deployed on Vercel. Designed
after the "E-commerce UI" Figma kit and built by [Edoardo (Edo Yang)](https://edoyang.github.io/).

The name comes from "kain", the Indonesian word for cloth.

## Changing the brand or contact details

Everything a visitor can see about the brand lives in one file, `src/lib/site.ts`: the store name,
phone, email, location, the promo line in the top bar and the social links. A social link that is
left empty is hidden everywhere, so adding Instagram later is a one line change.

## Stack

| Layer    | Tools                                                        |
| -------- | ------------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router     |
| API      | Express 5, Mongoose 9, Zod, JWT session in an httpOnly cookie |
| Database | MongoDB Atlas                                                |
| Hosting  | Vercel (static site + one serverless function + daily cron)  |

## Getting started

```bash
npm install
```

Create a `.env` file (see `.env.example`). Only `MONGODB_URI` is required.

```bash
npm run dev
```

The site and the API run together on one port. The first request fills an empty database with the
demo catalog, so there is nothing else to set up.

## Scripts

| Command             | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Site and API with hot reload                                       |
| `npm run build`     | Type check everything, then build the site into `dist`             |
| `npm run lint`      | ESLint                                                             |
| `npm run typecheck` | TypeScript only                                                    |
| `npm run db:seed`   | Create or refresh the demo catalog (safe to run again at any time) |
| `npm run db:ping`   | Check the database connection and record a keep-alive              |

## What is in the store

- Three home page layouts (`/`, `/home-2`, `/home-3`), shop, product, about, team, contact,
  pricing, blog and policies pages, all responsive
- Search, category pages, sorting, price, colour and sale filters, grid and list views, pagination
- Product gallery with zoom, colour and size options, reviews (one per customer per product)
- Cart and wishlist that work signed out, and follow the account once signed in
- Discount codes, two delivery methods, free delivery threshold
- Checkout, order confirmation, order history, cancelling an unpaid order
- Accounts: register, sign in, profile, saved address, change password
- Store admin at `/admin`: sales overview, product editor, order status, messages, subscribers
- Newsletter sign up and contact form

### Demo data

`npm run db:seed` creates 71 products in 5 categories, sample reviews, 6 blog posts, two discount
codes and a demo shopper account. Their values are in `server/seed/data.ts`.

Every product photo was checked by eye and shows no third party logo or brand mark. Please keep it
that way when adding products: the Unsplash License covers the photo, not a trademark shown in it.

The store admin account is only created when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set before
seeding. There is no default admin.

## Project layout

```
api/index.ts        Vercel entry point, hands every /api request to Express
server/             The API
  app.ts            Middleware and routes
  db.ts             Cached MongoDB connection
  env.ts            Environment variables
  auth.ts           Passwords, session cookie, access checks
  pricing.ts        Cart pricing, discount codes, delivery
  models/           Mongoose models
  routes/           catalog, auth, account, orders, content, payments, admin, system
  seed/             Demo data and the seed and ping scripts
src/                The storefront
  components/       Layout, UI kit, product, cart, account, home and inner page sections
  context/          Session, cart, wishlist, notifications
  hooks/            Data fetching
  pages/            One file per page
vercel.json         Rewrites, headers, function settings, cron
```

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel. The framework preset is Vite and the
   settings in `vercel.json` are picked up automatically.
2. In Project Settings > Environment Variables add:
   - `MONGODB_URI` (required)
   - `JWT_SECRET` and `CRON_SECRET` (recommended, any long random values)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (optional, then run `npm run db:seed` once)
3. In MongoDB Atlas, open Network Access and allow `0.0.0.0/0`. Vercel functions do not have a
   fixed IP address, so the database has to accept connections from anywhere. Access is still
   protected by the username and password in the connection string.
4. Deploy.

After the first deploy, open `/api/health` on the site. It reports the database connection and
the time of the last keep-alive.

## Keeping the database awake

Free MongoDB Atlas clusters are paused after a long period without activity. Three things keep
this one active:

| What                  | Where                             | When                        |
| --------------------- | --------------------------------- | --------------------------- |
| Vercel Cron           | `vercel.json`                     | Every day at 05:00 UTC      |
| GitHub Actions backup | `.github/workflows/keepalive.yml` | Every day at 17:30 UTC      |
| By hand               | `npm run db:ping`                 | Whenever you like           |

All three call the same endpoint, `/api/cron/keepalive`, which pings the database, writes a
heartbeat record and reads the catalog. The cron job runs on the production deployment only.

To switch on the GitHub backup, add a repository variable `SITE_URL` with the address of the
deployed site. If `CRON_SECRET` is set on Vercel, add the same value as a repository secret.

If a cluster has already been paused, it must be resumed from the Atlas dashboard. A keep-alive
cannot wake a paused cluster, it can only stop one from being paused.

## Security notes

- Passwords are stored as bcrypt hashes. The session is a signed JWT in an httpOnly, SameSite=Lax
  cookie, marked Secure in production, so page scripts never see it.
- Every write must be sent as JSON, which blocks cross site form posts.
- All input is validated with Zod before it reaches the database.
- Prices, stock, discounts and delivery are calculated on the server from the database. Values sent
  by the browser are never trusted.
- Stock is reserved with a conditional update, so the last item cannot be sold twice.
- Sign in, registration, reviews, contact and checkout are rate limited per IP address.
- Admin routes read the role from the database on every request.

## Payments (final phase)

Orders are created unpaid, with `payment.provider` set to `none`. The Stripe work is contained in
two places:

1. `server/routes/payments.ts` has the two endpoints to fill in: creating a Checkout Session for
   an order, and the webhook that marks the order as paid.
2. `src/pages/Checkout.tsx` and `src/pages/OrderPage.tsx` show the payment step and the order,
   where the "Pay now" button goes.

The webhook route already skips the JSON parser in `server/app.ts`, because Stripe signatures are
checked against the raw request body.

## Credits

Layout and style: "E-commerce UI" Figma kit by Captain Design. The brand, the copy and the catalog
are original to this project. Photos: Unsplash. Icons: Bootstrap Icons, Ant Design Icons and
BoxIcons through react-icons. Font: Montserrat.
