# Kainvara

A full stack fashion store: React storefront, Express API, MongoDB, deployed on Vercel. Designed
after the "E-commerce UI" Figma kit and built by [Edoardo (Edo Yang)](https://edoyang.github.io/).

The name comes from "kain", the Indonesian word for cloth.

## Changing the brand or contact details

Everything a visitor can see about the brand lives in one file, `src/lib/site.ts`: the store name,
phone, email, location, the promo line in the top bar and the social links. A social link that is
left empty is hidden everywhere, so adding Instagram later is a one line change.

The logo is `public/logo.svg`. It is shown in the header and footer, and the browser tab icon
(`favicon.svg`) is a copy of it. The PNG icons and the share image in `public` were drawn from the
same file, so replace them together if the logo ever changes:

| File                   | Size     | Used for                                  |
| ---------------------- | -------- | ----------------------------------------- |
| `favicon-48.png`       | 48x48    | Browsers and search results without SVG   |
| `apple-touch-icon.png` | 180x180  | iOS home screen (white background)        |
| `icon-192.png`         | 192x192  | Android home screen, web manifest         |
| `icon-512.png`         | 512x512  | Web manifest, logo in structured data     |
| `og-image.png`         | 1200x630 | Preview card when a link is shared        |

## Search and sharing (SEO)

- `index.html` holds the default title, description, canonical link, Open Graph and Twitter tags,
  and the structured data for the store and its site search. Crawlers that do not run scripts
  read these.
- `src/components/Seo.tsx` is used by every page. It updates the same tags in place (title,
  description, canonical link, share tags) and adds the structured data for that page, so there
  is never more than one of each in the head.
- `src/lib/structuredData.ts` builds the schema.org data: price, stock and rating for products,
  author and date for posts, and breadcrumbs.
- Cart, checkout, account, admin, sign in, wishlist, order pages and filtered or searched shop
  results are marked `noindex`. Category pages and their numbered pages are indexed.
- `/sitemap.xml` is built from the database on request (`server/routes/seo.ts`), so new products
  and posts are listed without a redeploy. `public/robots.txt` points to it.
- Chat apps and social networks do not run scripts. `vercel.json` sends only those preview bots
  (matched on their user agent) to a small HTML page with the product or post title, photo and
  price. Search engines and visitors always get the real page.
- Each page has one `h1`, and product and post photos carry the name as their alt text.

After deploying, add the site in [Google Search Console](https://search.google.com/search-console)
and submit `https://kainvara.vercel.app/sitemap.xml`. Bing Webmaster Tools can import the same
setup.

If the site moves to its own domain, change the address in four places: `url` in
`src/lib/site.ts`, the tags in `index.html`, the last line of `public/robots.txt`, and the
`SITE_URL` environment variable on Vercel (used by the sitemap and link previews).

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

Create a `.env` file in the project root. Only `MONGODB_URI` is required, the rest switch on
optional parts. The file is git ignored and must never be committed.

| Variable                | Needed   | What it is for                                                        |
| ----------------------- | -------- | --------------------------------------------------------------------- |
| `MONGODB_URI`           | Yes      | MongoDB Atlas connection string                                       |
| `MONGODB_DB`            | No       | Database name, `kainvara` when left out                               |
| `JWT_SECRET`            | Advised  | Signs the session cookie, any long random value                       |
| `CRON_SECRET`           | Advised  | Protects the keep-alive endpoint, any long random value               |
| `ADMIN_EMAIL`           | No       | With `ADMIN_PASSWORD`, creates the store admin when seeding           |
| `ADMIN_PASSWORD`        | No       | See above                                                             |
| `STRIPE_SECRET_KEY`     | No       | Switches on card payment. Use the test key (`sk_test_...`)            |
| `STRIPE_WEBHOOK_SECRET` | No       | Signing secret of the Stripe webhook (`whsec_...`), see Payments      |
| `STRIPE_ALLOW_LIVE`     | No       | Must be `true` before a live Stripe key is accepted                   |
| `SITE_URL`              | No       | Public address, only when it is not `https://kainvara.vercel.app`     |

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
- Checkout, card payment through Stripe Checkout, order history, cancelling an unpaid order
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
public/             Logo, icons, share image, robots.txt, web manifest
server/             The API
  app.ts            Middleware and routes
  db.ts             Cached MongoDB connection
  env.ts            Environment variables
  auth.ts           Passwords, session cookie, access checks
  pricing.ts        Cart pricing, discount codes, delivery
  payments.ts       Stripe Checkout: payment page, recording a payment, refunds
  models/           Mongoose models
  routes/           catalog, auth, account, orders, content, payments, admin, system, seo
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
   - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (optional, see Payments below)
   - `SITE_URL` (optional, only when the site is not at `https://kainvara.vercel.app`)
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
- Card details are entered on Stripe's own page and never reach this site or its database. The
  amount charged is built from the stored order, and a payment is only recorded after Stripe
  confirms it, for exactly the order total.
- Webhooks are accepted only with a valid Stripe signature.

## Payments

Card payment uses Stripe Checkout, the payment page hosted by Stripe.

1. Placing an order reserves the stock and creates the order as unpaid.
2. The shopper is sent to the Stripe payment page, which lists the items, the discount and the
   delivery charge of that order.
3. Stripe sends the shopper back to the order page. The order is marked paid in two independent
   ways, so it is right even if one of them fails: the order page asks Stripe for the result, and
   Stripe calls the webhook.
4. If the shopper leaves without paying, the order stays reserved and can be paid later with the
   "Pay Now" button on the order page. Cancelling the order closes the payment page and puts the
   stock back on sale.

The code is in `server/payments.ts` and `server/routes/payments.ts`, the pages are
`src/pages/Checkout.tsx` and `src/pages/OrderPage.tsx`.

### Test mode

The store is a demonstration, so it is meant to run on Stripe **test keys**. No real money moves
and the site shows the test card to visitors: `4242 4242 4242 4242`, any future expiry date, any
security code. A live key is ignored unless `STRIPE_ALLOW_LIVE=true` is also set, so real
payments cannot be switched on by accident.

### Setting it up

1. In the Stripe dashboard (test mode, or a sandbox), copy the secret key and set it as
   `STRIPE_SECRET_KEY` in `.env` and in the Vercel project. Card payment is now on.
2. After deploying, add a webhook endpoint in Stripe under Developers > Webhooks:
   - Endpoint URL: `https://kainvara.vercel.app/api/payments/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`
3. Copy the signing secret of that endpoint (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` on Vercel
   and redeploy.

The webhook is not needed for local development, the order page confirms the payment with Stripe
directly. To try webhooks locally, run `stripe listen --forward-to localhost:5173/api/payments/webhook`
with the Stripe CLI and use the secret it prints.

The name shown on the payment page is the business name of the Stripe account, change it in
Stripe under Settings > Business > Branding.

## Credits

Layout and style: "E-commerce UI" Figma kit by Captain Design. The brand, the copy and the catalog
are original to this project. Photos: Unsplash. Logo: shopping bag icon from SVG Repo. Icons:
Bootstrap Icons, Ant Design Icons and BoxIcons through react-icons. Font: Montserrat.
