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
