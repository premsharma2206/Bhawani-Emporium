# Bhawani Emporium

Online store for Bhawani Emporium (handicrafts, gifts and novelties). This is the React + Node.js rebuild of the old PHP site.

- **Next.js** (App Router, TypeScript) for the storefront, admin area and server code
- **PostgreSQL** with **Prisma**
- **Tailwind CSS**
- Optional: **Cloudinary** for product photos, **SMTP** for order emails, **Razorpay** for online payment

## Run it locally

Needs Node.js 20.9 or newer (see `.nvmrc`) and Docker for the database.

```bash
cp .env.example .env        # then set SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d        # local PostgreSQL on port 54329
npm install
npm run db:migrate          # create the tables
npm run db:seed             # admin account + two sample products
npm run dev                 # http://localhost:3000
```

Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach the admin area at `/admin`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Unit tests |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |
| `npm run db:migrate` | Apply schema changes in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Create the admin account and sample products |
| `npm run make-admin -- <email>` | Give an existing account the admin role |
| `npm run import:legacy -- <export.json> [old-site-dir]` | Import data from the old PHP site |

## Optional services

Each one is switched on by its environment variables in `.env`. Without them the site still works:

| Service | Variables | Without it |
|---|---|---|
| Order emails | `SMTP_*`, `EMAIL_FROM`, `SHOP_EMAIL` | Emails are printed to the server log |
| Cloudinary | `CLOUDINARY_URL` | Photos are saved in `UPLOAD_DIR` on the server's disk |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Checkout offers pay on delivery only |

For Razorpay, add a webhook in the Razorpay dashboard pointing at `https://<your-domain>/api/razorpay/webhook` for the `payment.captured` event, using the same secret as `RAZORPAY_WEBHOOK_SECRET`.

## Importing from the old site

1. In phpMyAdmin on the old host, export the whole database in **JSON** format.
2. Point `DATABASE_URL` at an empty, migrated database and set `ADMIN_EMAIL` to the shop owner's account.
3. Run `npm run import:legacy -- export.json /path/to/ecommerce-website`.

Customers keep their passwords: the old MD5 hash is checked once at their first login and replaced with a bcrypt hash. Each customer's confirmed items become one historical order, because the old site stored no order dates.

## Deploying

Any host that runs Node.js and PostgreSQL works (Railway, Render, a VPS).

- Build: `npm run build`. Start: `npm run db:deploy && npm start`.
- Set every variable from `.env.example` that you use. `SESSION_SECRET` and `DATABASE_URL` are required.
- Configure Cloudinary in production. Photos saved in `UPLOAD_DIR` are lost on hosts without a persistent disk.

## Layout

```
prisma/           schema, migrations, seed
scripts/          import-legacy, make-admin
src/app/          pages and route handlers
src/actions/      server actions (auth, cart, orders, account, admin)
src/components/   shared UI
src/lib/          database, sessions, access checks, payments, email, images
```
