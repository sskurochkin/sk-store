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
- `email` — scaffolded placeholder until Phase 9

### Orders pricing rule

The backend is the source of truth for order money. Clients submit `productId` + `quantity` only. `Product.price` is loaded from PostgreSQL and calculated with Prisma `Decimal` (`price.mul(quantity)`). Client-provided `price` / `totalPrice` are never trusted.

See `development_plan.md` for the full product and architecture plan.
