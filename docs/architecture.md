# Architecture

SK Store is split into two applications:

- `frontend` — Next.js public site and admin UI
- `server` — NestJS API, Prisma, business rules

## Server foundation (Phase 3)

- Global API prefix: `/api`
- Config via `@nestjs/config` (`DATABASE_URL`, `PORT`, CORS)
- Global `ValidationPipe` (class-validator) for request DTOs
- Global `HttpExceptionFilter`
- `PrismaModule` / `PrismaService` with connect/disconnect lifecycle
- Health: `GET /api/health`

## Feature modules

- `auth` — admin login/logout/me via HTTP-only JWT cookie + `JwtAuthGuard`
- `products` — public product read + admin product CRUD (Phase 5)
- `news` — public news read + admin news CRUD with HTML sanitization on write (Phase 6)
- `socials` — public social list (MVP settings retrieval) + admin CRUD (Phase 7)
- `orders` — public `POST /api/orders` with server-side pricing, Decimal totals, transactional Order + OrderItem snapshots (Phase 8)
- `contact-requests` — public `POST /api/contact-requests` + admin list/detail/status (JWT; Phase 16 + 21)
- `email` — `EmailModule` / `EmailService` with Nodemailer transport; order confirmation after successful create (Phase 9)
- Admin UI foundation (Phase 17) — same-origin `/api` rewrite, `/admin/login`, protected `/admin` shell (see below)

### Frontend public design system (Phase 10)

Public UI uses CSS variables + CSS Modules (no Tailwind on the public site).

- Tokens: `frontend/src/styles/tokens.css` (colors, typography, spacing, layout, motion)
- Base: `frontend/src/styles/base.css` (reset, links, focus-visible, selection, reduced-motion)
- Primitives: `frontend/src/components/ui/` — Button, Container, Section, Heading, Text, Card, Badge, Input, Textarea, IconButton, MediaImage, Loading/Empty/Error states
- Components are Server Components by default (no `"use client"`)

Responsive strategy is mobile-first with media queries at `40rem` / `60rem` / `80rem` (tablet / desktop / wide).

### Public layout (Phase 11)

- `Header` (Server) + `MobileNav` (Client) for open/close only
- `Footer` (async Server) loads `GET /api/socials` via `getSocials()`; empty/error → footer without social block
- Root layout: `Header` → `<main>` → `Footer`
- Public API helper: `frontend/src/services/api.ts`

### Products UI (Phase 12)

- `/products` — catalog listing (RSC) via `getProducts()`; empty → `EmptyState`, API failure → `ErrorState`
- `/products/[alias]` — product detail (RSC) via `getProductByAlias()`; unknown alias → `notFound()`
- `frontend/src/services/products.ts` — public product fetch with cache tags `products` / `product:alias:{alias}`
- `ProductCard` (Server); `ProductGallery` and `QuantityControls` (Client)
- `next.config.ts` allows `images.remotePatterns` for seed host `example.com`

### Cart (Phase 13)

- `CartProvider` in root layout wraps Header / main / Footer; `useCart()` API: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getItemCount`, `getTotal`
- Persistence: `localStorage` key `sk-store:cart` via `frontend/src/lib/cart-storage.ts` only; hydrate after mount
- Cart item: `productId`, `quantity` (1–99), `name`, `price` (UX snapshot), `mainPhoto`, `alias`
- `/cart` — list / empty / qty / remove / clear
- Header `MiniCart` → `/cart` with item-count badge; product detail `ProductPurchaseControls` → «В корзину»

### Checkout (Phase 14)

- Checkout form on `/cart` (React Hook Form + Zod); no separate `/checkout` route
- Fields: `firstName`, `lastName`, `userEmail`, `userPhone`, required client-only `consent` (not sent to API)
- `createOrder()` → `POST /api/orders` with `productId` + `quantity` only; prices never trusted from client
- Success: `clearCart()` + success panel with order `id` and server `totalPrice`; errors keep the cart
- `apiPost` in `frontend/src/services/api.ts`; UI: `Checkbox` primitive

### News UI (Phase 15)

- `/news` — list (RSC) via `getNewsList()`; empty → `EmptyState`, API failure → `ErrorState`
- `/news/[alias]` — article (RSC) via `getNewsByAlias()`; unknown alias → `notFound()`
- Cache tags: `news`, `news:alias:{alias}` (revalidate 60s)
- `NewsCard` (Server); `NewsArticleContent` renders backend-sanitized HTML via `dangerouslySetInnerHTML` (server-fetched only)
- Fields used: `title`, `alias`, `description`, `mainPhoto`, `content`, `createdAt`, optional `tags: string[]`
- News detail: main column (~70%) + related-by-tag sidebar; full width when no related items
- `Breadcrumbs` on internal pages; home crumb is an icon with `aria-label="Главная"`

### Contacts (Phase 16)

- `/contacts` — RSC page via existing `getSocials()` (tag `socials`, revalidate 60s)
- Shows social links (no invented phone/email/address); empty/API failure → neutral `EmptyState`
- Shared display helper: `components/social/SocialLinks` — sprite `Icon` + name; variants `footer` | `cards` | `inline` | `preview`
- Public **contact request form** (Client Component) → `POST /api/contact-requests`
- Form fields: `firstName`, `lastName`, `phone` (Belarus mask → `+375…`), `email`, `message`, required `consent` (stored)
- Page order: socials → map placeholder (future) → contact form
- Socials fetch failure must not break the form

### ContactRequest (Phase 16 foundation)

Purpose: store public contact form submissions for later admin follow-up.

```text
ContactRequest
  id, firstName, lastName, phone, email, message, consent
  status (NEW | IN_PROGRESS | COMPLETED | CANCELLED)
  createdAt, updatedAt
```

Lifecycle:

```text
NEW → IN_PROGRESS → COMPLETED
         ↘ CANCELLED (from NEW or IN_PROGRESS)
```

Public API:

- `POST /api/contact-requests` — no JWT; ValidationPipe; throttled (`ThrottlerGuard`); status forced to `NEW`
- Response: `{ id, status, createdAt }` (no need to echo PII back)

Admin API (Phase 21, JWT required):

- `GET /api/contact-requests`
- `GET /api/contact-requests/:id`
- `PATCH /api/contact-requests/:id/status`

Security:

- client cannot set `status` / `id` / timestamps (`forbidNonWhitelisted`)
- do not log full email, phone, or message
- message stored and displayed as plain text only
- no contact-request email notification in this phase (Orders email remains separate)
- no automatic deletion / retention purge / DELETE endpoint

Frontend Admin UI: `/admin/contact-requests`, `/admin/contact-requests/[id]`

### Admin UI foundation (Phase 17)

```text
Browser
   │  same-origin /api/*
   ▼
Next.js (:3000)
   │  rewrite → Nest (:3001)
   ▼
NestJS Auth / API
   │
   ▼
HTTP-only JWT cookie (`access_token`)
```

- `next.config.ts` rewrites `/api/:path*` → `NEXT_PUBLIC_API_URL/api/:path*`
- Browser helpers use same-origin `/api/...` (empty base URL in the browser)
- Server Components still call Nest origin for public data; authenticated server checks forward `Cookie`
- `middleware` protects `/admin/*` (except login) via Nest `GET /api/auth/me`
- Routes: `/admin/login` (public), `/admin` dashboard + shell; Products + News + Orders + Contact Requests + Settings live
- JWT never in localStorage / sessionStorage / URL / rendered HTML

### Admin Products (Phase 18)

- Routes: `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
- `frontend/src/services/admin-products.ts` — list (`cache: "no-store"`), create, update, delete via Nest Products API
- `apiPatch` / `apiDelete` in `frontend/src/services/api.ts` (cookie / same-origin)
- Form: RHF + Zod (`admin-product-schema`); `mainPhoto` / gallery as URL strings (no upload)
- Edit loads product by scanning admin list (no `GET /products/:id`); public catalog cache tags invalidated on admin CUD (Phase 23)

### Admin News (Phase 19)

- Routes: `/admin/news`, `/admin/news/new`, `/admin/news/[id]/edit`
- `frontend/src/services/admin-news.ts` — list (`cache: "no-store"`), create, update, delete via Nest News API
- Form: RHF + Zod (`admin-news-schema`); `content` as HTML textarea (server `sanitizeNewsHtml` on write); optional `tags`; `mainPhoto` URL string
- Edit loads news by scanning admin list (no `GET /news/:id`); public `/news` cache tags invalidated on admin CUD (Phase 23)

### Admin Orders (Phase 20)

- Nest admin API (JWT): `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `DELETE /orders/:id`
- Public `POST /orders` unchanged — create response still omits customer PII
- Admin responses include `firstName`, `lastName`, `userEmail`, `userPhone`, timestamps; list omits `items`, detail includes snapshots
- Frontend: `/admin/orders`, `/admin/orders/[id]`; status select + modal delete confirm; labels in `constants/order-status.ts`
- List table: client-side sort (дата / клиент / статус / сумма) + pagination (`ADMIN_TABLE_PAGE_SIZE`)

### Admin Contact Requests (Phase 21)

- Nest admin API (JWT): `GET /contact-requests`, `GET /contact-requests/:id`, `PATCH /contact-requests/:id/status`, `DELETE /contact-requests/:id`
- Public `POST /contact-requests` unchanged — create response still `{ id, status, createdAt }` only
- Admin responses include PII + `message` + `consent` + timestamps; admin may hard-delete a request (no automatic purge)
- Frontend: `/admin/contact-requests`, `/admin/contact-requests/[id]`; status select + modal delete; labels in `constants/contact-request-status.ts`
- List table: client-side sort (дата / клиент / статус) + pagination (`ADMIN_TABLE_PAGE_SIZE`)

### Admin Settings (Phase 22)

- Nest Socials API unchanged (Phase 7): public `GET /socials`; JWT `POST` / `PATCH` / `DELETE`
- Frontend hub: `/admin/settings` (extensible); socials CRUD at `/admin/settings/socials/new` and `/admin/settings/socials/[id]/edit`
- `frontend/src/services/admin-socials.ts` — list (`cache: "no-store"`), create, update, delete
- Form: RHF + Zod (`admin-social-schema`); fields `name`, `link` (http/https), `icon` (string key/URL — no binary upload)
- Public footer/contacts use `getSocials()`; tags invalidated on socials CUD (Phase 23)

### Cache revalidation (Phase 23)

After successful admin create/update/delete, client forms call authenticated Server Actions that run `revalidateTag` on the Next.js server:

| Mutation | Tags |
| --- | --- |
| Product CUD | `products`, `product:alias:{alias}` (old + new on update) |
| News CUD | `news`, `news:alias:{alias}` (old + new on update) |
| Social CUD | `socials`, `settings` |

- Helpers: `frontend/src/lib/cache-tags.ts` (builders + alias allowlist), `frontend/src/lib/revalidate-public-cache.ts` (`"use server"`)
- Revalidate actions require admin session via `getCurrentUser()`; arbitrary tag strings from the client are not accepted
- Orders / contact-requests: no public cache tags
- ISR `revalidate: 60` remains a fallback if a tag is missed

### Site settings

- `SiteSettings` singleton in PostgreSQL; public `GET /api/settings`, admin `PATCH /api/settings`
- Frontend: `getSiteSettings()` merges API response with [`site-settings.defaults.ts`](../frontend/src/constants/site-settings.defaults.ts)
- Used by Header, Footer, HomeHero, Contacts, page-level SEO
- Admin hub: `/admin/settings` — general, contacts, map, socials, home benefits, legal pages
- Cache tag: `settings` (revalidate on PATCH)
- See [`docs/site-settings.md`](./site-settings.md)

### Home benefits

- `HomeBenefit` model; public `GET /api/home-benefits`; admin CRUD
- `HomeBenefits` on `/` loads from API; fallback to constants if empty/error
- Cache tag: `home-benefits`

### Legal pages (CMS)

- `LegalPage` model (`privacy-policy`, `cookie-policy`); public `GET /api/legal-pages/:slug`
- Public pages use API content with fallback to constants; privacy placeholders from site settings
- Admin: `/admin/settings/legal/[slug]`
- Cache tags: `legal-page:{slug}`

### Legal pages and cookie consent

- `/privacy-policy` — privacy policy; RSC + `LegalDocument`
- `/cookie-policy` — cookie/localStorage explanation; link to privacy policy + «Настройки cookie»
- `CookieConsentBanner` in shop layout only; consent in `localStorage` key `sk-store:cookie-consent`
- Categories: necessary (always on), functional, analytics, marketing — optional categories default off
- Future analytics/marketing must read consent before loading scripts (see [`docs/cookie-consent.md`](./cookie-consent.md))
- Footer «Документы»: privacy, cookie policy, cookie settings reopen link

### SEO / Performance (Phase 24)

- `NEXT_PUBLIC_SITE_URL` → `getSiteUrl()` → root `metadataBase` ([`constants/site.ts`](../frontend/src/constants/site.ts))
- Shared helper [`lib/seo.ts`](../frontend/src/lib/seo.ts) `buildPageMetadata` — title, description, `alternates.canonical`, Open Graph, Twitter
- Public pages under `app/(shop)/`: home, products, news, contacts, cart, privacy-policy, cookie-policy, product/news detail
- Product/news detail: OG image from `mainPhoto` only when it is an absolute `http(s)` URL
- `/cart` and `/admin/*`: `robots: { index: false, follow: false }`
- Images: `MediaImage` → `next/image`; `remotePatterns` include `example.com` plus optional `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS`
- Performance: public catalog/news/socials via RSC + ISR tags (Phase 23); cart/checkout client only where needed; no sitemap/robots.txt/JSON-LD yet (Future §17)

### Security review (Phase 25)

- Controls matrix + production checklist: [`docs/security.md`](./security.md)
- Production CORS requires explicit `CORS_ORIGIN` (no reflect-any / `*`)
- Named throttlers: `login` vs `publicWrite` (orders + contact-requests)
- Auth cookies remain HTTP-only; JWT never in frontend localStorage

### Admin list UX (shared)

- Delete actions use accessible `ConfirmModal` (not `window.confirm`)
- Admin list tables paginate with `ADMIN_TABLE_PAGE_SIZE` (`frontend/src/constants/admin-table.ts`, default `3`)
- Shared helpers: `AdminTablePagination`, `useAdminTablePage` in `lib/admin-table.ts`

### Orders pricing rule

The backend is the source of truth for order money. Clients submit `productId` + `quantity` only. `Product.price` is loaded from PostgreSQL and calculated with Prisma `Decimal` (`price.mul(quantity)`). Client-provided `price` / `totalPrice` are never trusted.

### Email

`EmailService` hides the transport (Nodemailer). `OrdersModule` depends on `EmailModule`; email never runs inside a Prisma `$transaction`.

Flow:

```text
validate → load products → calculate totals → $transaction (Order + OrderItems)
  → commit → EmailService.sendOrderConfirmation(snapshot) → return 201
```

If email fails after commit, the order remains and the API still returns success. Configuration: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM`, `ORDER_NOTIFICATION_EMAIL`. Without `SMTP_HOST` (local/test), transport is Nodemailer `jsonTransport`.

See `development_plan.md` for the full product and architecture plan.
