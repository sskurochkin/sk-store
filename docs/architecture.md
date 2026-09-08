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

Feature modules (`auth`, `products`, `news`, `orders`, `socials`, `email`) are scaffolded as empty placeholders until later phases.

See `development_plan.md` for the full product and architecture plan.
