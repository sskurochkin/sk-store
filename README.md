# SK Store

Bakery showcase and ordering website.

## Structure

- `frontend` — Next.js (TypeScript): public site + admin UI
- `server` — NestJS (TypeScript) + Prisma: API, auth, pricing, email
- `docs` — architecture, API, auth, database, deployment, security
- `development_plan.md` — product/architecture source of truth

PostgreSQL is expected to run locally on the host. Docker Compose does **not** create a PostgreSQL container.

## Prerequisites

- Node.js 20+
- PostgreSQL with a database matching `DATABASE_URL`

## Setup

### Server

```bash
cd server
cp ../.env.example .env   # or ensure DATABASE_URL is set
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed       # bootstrap admin: admin / admin123
npm run start:dev
```

Default API port: `3001`

### Frontend

```bash
cd frontend
cp ../.env.example .env.local   # adjust NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

Default frontend port: `3000`

Browser API calls use same-origin `/api/*` (Next.js rewrite → NestJS). `NEXT_PUBLIC_API_URL` is the Nest origin for rewrites and server-side fetches.

## Quality checks

```bash
# frontend
cd frontend && npm run typecheck && npm run lint && npm run build

# server
cd server && npm run typecheck && npm run lint && npm run build
# optional: npm test / npm run test:e2e
```

## Phase status

**Completed through Phase 25 — Security Review.**

Next: **Phase 26 — Testing**, then **Phase 27 — Production Readiness**.

| Phases | Status | What landed |
| --- | --- | --- |
| 0–3 | Done | Repo split, Prisma/PostgreSQL, Nest foundation |
| 4–9 | Done | Auth (HTTP-only JWT cookie), Products/News/Socials/Orders APIs, EmailService |
| 10–16 | Done | Public design system, layout, products, cart, checkout, news, contacts + contact requests |
| 17–22 | Done | Admin shell + Products / News / Orders / Contact Requests / Settings (socials) |
| 23 | Done | Cache tag revalidation after admin mutations |
| 24 | Done | Metadata, Open Graph, canonical URLs, `next/image` remote hosts |
| 25 | Done | CORS hardening, login/public-write rate limits, security checklist (`docs/security.md`) |
| 26–27 | Pending | Broader test suite / E2E; production deploy docs & ops |

### Public site

Routes: `/`, `/products`, `/products/[alias]`, `/news`, `/news/[alias]`, `/contacts`, `/cart`.

- Cart in `localStorage` via `CartProvider` (UX only; prices recalculated on the server)
- Checkout on `/cart` → `POST /api/orders` with `productId` + `quantity` only
- Contact form → `POST /api/contact-requests` (throttled; status always `NEW`)

### Admin

Routes: `/admin/login`, `/admin` dashboard, Products, News, Orders, Contact Requests, Settings (socials).

- Cookie auth on the Next origin; middleware + layout guard for `/admin/*`
- List tables: page size `ADMIN_TABLE_PAGE_SIZE` (default 3); orders/contact-requests support column sorting; deletes use a confirmation modal
- Admin CUD invalidates public cache tags (`products`, `news`, `socials`, …)

### Docs

See `docs/` for details: `architecture.md`, `api.md`, `authentication.md`, `database.md`, `deployment.md`, `security.md`.

Production checklist (secrets, CORS, cookie Secure, rate limits, rotate seed admin) lives in `docs/security.md` and `docs/deployment.md`.
