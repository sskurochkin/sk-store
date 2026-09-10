# Deployment

## Architecture

```text
Browser → Next.js (frontend) → /api/* rewrite → NestJS (server) → PostgreSQL
```

PostgreSQL runs on the host (or managed service). **Docker Compose does not provision PostgreSQL** — see root `docker-compose.yml`.

Local development:

- PostgreSQL on the host
- `server` on port 3001
- `frontend` on port 3000

## Development setup

See root `README.md` for install, migrate, seed, and dev start commands.

## Production build

Set frontend public env **before** `next build` — `NEXT_PUBLIC_*` values are embedded at build time (changing them at `next start` alone is not enough).

```bash
cd server && npm install && npx prisma generate && npm run build
cd frontend && npm install && npm run build
```

## Production database

On a clean PostgreSQL database:

```bash
cd server
npx prisma migrate deploy
```

Use `prisma migrate deploy` in production — **not** `prisma migrate dev`.

`npx prisma db seed` is for bootstrap/dev only. It is **not** invoked by `npm run start:prod`.

## Production start

```bash
# API (requires production env — see below)
cd server && npm run start:prod

# Frontend (separate process)
cd frontend && npm run start
```

Health check: `GET /api/health` (same-origin through Next, or directly on the Nest port).

## Environment variables

Documented in root `.env.example` and `server/.env.example`.

### Server — required in production (`NODE_ENV=production`)

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random secret |
| `CORS_ORIGIN` | Exact frontend origin (no `*`) |
| `SMTP_HOST` | Real SMTP host (empty allowed in dev only) |
| `MAIL_FROM` | From address |
| `ORDER_NOTIFICATION_EMAIL` | Business notification inbox |

### Server — recommended / defaults

| Variable | Default / notes |
| --- | --- |
| `PORT` | `3001` |
| `COOKIE_SECURE` | `true` in production |
| `COOKIE_SAME_SITE` | `lax` |
| `AUTH_LOGIN_RATE_LIMIT` / `AUTH_LOGIN_RATE_TTL_MS` | `5` / `60000` |
| `PUBLIC_WRITE_RATE_LIMIT` / `PUBLIC_WRITE_RATE_TTL_MS` | `5` / `60000` |

### Frontend

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Nest origin for rewrites and server-side fetches (not exposed to browser fetches — use `/api/*`) |
| `NEXT_PUBLIC_SITE_URL` | Public site origin for metadata/OG/canonical (no trailing slash) |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | Optional comma-separated hostnames for `next/image` |

Never put secrets in `NEXT_PUBLIC_*`.

## Frontend public URL (SEO)

Set `NEXT_PUBLIC_SITE_URL` in `frontend/.env.local` (documented in root `.env.example`).

- Local default / fallback: `http://localhost:3000`
- Production: the real public origin (no trailing slash), e.g. `https://shop.example.com`

Used for Next.js `metadataBase`, Open Graph absolute URLs, and canonical links.

Optional: `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` — comma-separated hostnames allowed by `next/image` (in addition to `example.com` from seed/demo data).

## Production security checklist

See [`docs/security.md`](./security.md) for the full matrix. Minimum before production:

- Strong `JWT_SECRET` (not the example placeholder)
- `COOKIE_SECURE=true`
- Explicit `CORS_ORIGIN` matching the frontend origin (required when `NODE_ENV=production`)
- Change seed admin credentials (`admin` / `admin123` are bootstrap-only)
- Configure real SMTP + `MAIL_FROM` + `ORDER_NOTIFICATION_EMAIL`
- Configure `AUTH_LOGIN_RATE_*` and `PUBLIC_WRITE_RATE_*`
- Never commit `.env` / `.env.local`
