# Deployment

## Architectures

### Development (host PostgreSQL)

```text
Browser → Next.js :3000 → /api/* rewrite → NestJS :3001 → PostgreSQL (host)
```

See root `README.md` for local setup without Docker.

### Production (Docker)

```text
Internet
   ↓
Reverse Proxy (Nginx) — HTTPS
   ↓
frontend :3000 (Docker)
   ↓ /api/* rewrite
backend :3001 (Docker, internal)
   ↓
postgres :5432 (Docker, internal + persistent volume)
```

Files:

| File | Purpose |
| --- | --- |
| `docker-compose.prod.yml` | Production stack |
| `server/Dockerfile` | NestJS multi-stage image |
| `frontend/Dockerfile` | Next.js standalone image |
| `.env.production.example` | Production env template (copy to server) |
| `deploy/nginx/sk-store.conf.example` | HTTPS reverse proxy example |

**Do not use `docker compose down -v`** in normal operations — `-v` deletes the `postgres_data` volume.

---

## Production Docker workflow

### 1. Clone and configure

```bash
git clone <repository-url> /opt/sk-store
cd /opt/sk-store
cp .env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production`:

- Set strong `POSTGRES_PASSWORD`, `JWT_SECRET`
- Set `NEXT_PUBLIC_SITE_URL` and `CORS_ORIGIN` to `https://YOUR_DOMAIN`
- Configure SMTP variables
- Keep `COOKIE_SECURE=true` (requires HTTPS via reverse proxy)

### 2. Build images

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
```

Rebuild after code changes or when `NEXT_PUBLIC_*` build args change.

### 3. Start PostgreSQL

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
```

Wait until healthy:

```bash
docker compose -f docker-compose.prod.yml ps postgres
```

### 4. Run migrations

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy
```

Use `migrate deploy` — **not** `migrate dev`, `db push`, or `migrate reset`.

### 5. Bootstrap seed (first deploy only)

Production image ships a compiled seed script (no `ts-node` in runtime):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend node dist/prisma/seed.js
```

Creates bootstrap admin `admin` / `admin123`. **Change this password before public go-live.**

Seed is **not** run automatically on `up`. Local dev can still use `npx prisma db seed` with `ts-node`.

### 6. Start application

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 7. Configure reverse proxy + HTTPS

See `deploy/nginx/sk-store.conf.example`. Proxy to `127.0.0.1:3000` (frontend).

Backend (`3001`) and PostgreSQL (`5432`) must **not** be published to the Internet.

### 8. Verify

```bash
curl -s https://YOUR_DOMAIN/api/health
curl -s -o /dev/null -w "%{http_code}" https://YOUR_DOMAIN/
```

---

## Operations

### Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Stop

```bash
docker compose -f docker-compose.prod.yml down
```

Data persists in `postgres_data` volume.

### Restart

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Migration (update deploy)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend frontend
```

### Backup

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U skstore_app -d skstore --no-owner --format=custom \
  > skstore-$(date +%Y%m%d-%H%M%S).dump
```

Store backups **outside** the Docker volume (server backup dir / external storage).

### Restore

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U skstore_app -d skstore --clean --if-exists < backup.dump
```

Test restore on a non-production database first.

### Update deployment

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Rollback

1. Check out previous Git tag/commit.
2. Rebuild images.
3. Restore database backup if schema/data rollback is required.
4. `docker compose ... up -d`

Prisma migrations are forward-only — plan rollbacks with backups.

---

## Environment variables

### PostgreSQL (Compose)

| Variable | Default | Notes |
| --- | --- | --- |
| `POSTGRES_DB` | `skstore` | Database name |
| `POSTGRES_USER` | `skstore_app` | Application user |
| `POSTGRES_PASSWORD` | **required** | Never commit |

`DATABASE_URL` is composed automatically for the backend service:

```text
postgresql://skstore_app:<password>@postgres:5432/skstore?schema=public
```

### Backend — required in production

| Variable | Notes |
| --- | --- |
| `JWT_SECRET` | Long random secret |
| `CORS_ORIGIN` | Exact public frontend origin (`https://YOUR_DOMAIN`) |
| `SMTP_HOST` | SMTP server |
| `MAIL_FROM` | From address |
| `ORDER_NOTIFICATION_EMAIL` | Business inbox |

### Backend — defaults

| Variable | Default |
| --- | --- |
| `PORT` | `3001` |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `lax` |
| `AUTH_LOGIN_RATE_*` | `5` / `60000` |
| `PUBLIC_WRITE_RATE_*` | `5` / `60000` |

### Frontend — build-time (`NEXT_PUBLIC_*`)

Set in `.env.production` before `docker compose build`:

| Variable | Docker value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR_DOMAIN` | Metadata / OG / canonical |
| `NEXT_PUBLIC_API_URL` | `http://backend:3001` | **Internal** — rewrites + server/middleware fetches only |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | optional | `next/image` hostnames |

Browser code uses same-origin `/api/*`. Never expose `postgres` or internal Docker hostnames to browsers.

---

## Development setup

See root `README.md` for install, migrate, seed, and dev start commands.

## Production security checklist

See [`docs/security.md`](./security.md). Minimum before public production:

- Strong `JWT_SECRET` and `POSTGRES_PASSWORD`
- `COOKIE_SECURE=true` with HTTPS
- Explicit `CORS_ORIGIN` matching public origin
- Change seed admin credentials
- Configure real SMTP
- Never commit `.env.production`
- PostgreSQL and backend not publicly exposed
