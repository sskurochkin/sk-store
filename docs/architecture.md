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
- `email` — `EmailModule` / `EmailService` with Nodemailer transport; order confirmation after successful create (Phase 9)

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
