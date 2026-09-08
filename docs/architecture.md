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
- `orders`, `socials`, `email` — scaffolded placeholders until later phases

See `development_plan.md` for the full product and architecture plan.
