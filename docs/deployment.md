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
Nginx (host) :443 HTTPS
   ↓
127.0.0.1:3000 → frontend container
   ↓ /api/* rewrite (API_INTERNAL_URL → backend:3001)
backend :3001 (Docker internal)
   ↓
postgres :5432 (Docker internal + postgres_data volume)
```

Frontend binds to **localhost only** on the host. Ports `3001` and `5432` are not published.

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

- Set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD` (min 12 chars, not `admin123`)
- Set `NEXT_PUBLIC_SITE_URL` and `CORS_ORIGIN` to `https://YOUR_DOMAIN`
- Configure SMTP variables
- Keep `COOKIE_SECURE=true` (requires HTTPS via reverse proxy — do not launch publicly with `false`)

### 2. Build images

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build
```

Rebuild after code changes or when `NEXT_PUBLIC_SITE_URL` / image host build args change.

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

Creates admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env.production`. Production seed **rejects** `admin123` and passwords shorter than 12 characters. Demo products/news (`example.com` images) are **not** seeded in production — add catalog via admin after deploy.

Seed is **not** run automatically on `up`. Local dev can still use `npx prisma db seed` with `ts-node` (defaults to `admin` / `admin123`).

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

1. **Backup database first** (see Backup above).
2. Pull code and review new migrations.
3. Build and migrate:

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

4. Smoke test public pages + admin login.

Never run `docker compose down -v` during updates.

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

### Admin bootstrap (production seed)

| Variable | Notes |
| --- | --- |
| `ADMIN_USERNAME` | default `admin` |
| `ADMIN_PASSWORD` | **required** for production seed; min 12 chars; never `admin123` |

### Frontend — build-time

Set in `.env.production` before `docker compose build`:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR_DOMAIN` — metadata / OG / canonical |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | optional — `next/image` hostnames |

`API_INTERNAL_URL=http://backend:3001` is set in `docker-compose.prod.yml` build args (server-only, not in client bundle).

Browser code uses same-origin `/api/*`. Never expose `postgres` or internal Docker hostnames to browsers.

---

## DNS

Before HTTPS and public launch:

- [ ] **A record** → server IPv4 for `YOUR_DOMAIN`
- [ ] **AAAA record** → correct IPv6 **or remove** if IPv6 is not configured on the server
- [ ] Propagation verified (`dig YOUR_DOMAIN`)

---

## Server firewall

Allow publicly:

| Port | Purpose |
| --- | --- |
| `80/tcp` | HTTP → HTTPS redirect, ACME |
| `443/tcp` | HTTPS |
| `22/tcp` | SSH (restrict to admin IPs when possible) |

Do **not** expose publicly:

| Port | Reason |
| --- | --- |
| `3000` | Frontend — localhost + Nginx only |
| `3001` | Backend — Docker internal |
| `5432` | PostgreSQL — Docker internal |

Do not rely on Docker port binding alone — configure `ufw` / cloud security groups.

---

## HTTPS (Let's Encrypt)

After Nginx is configured and DNS resolves:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

Verify:

- HTTP redirects to HTTPS
- `COOKIE_SECURE=true` in `.env.production`
- Admin login works over HTTPS
- Auth cookie has `Secure` and `HttpOnly` flags

Renewal: certbot timer (usually automatic via `certbot renew`).

---

## Docker logs

Production Compose configures JSON log rotation (`max-size: 10m`, `max-file: 5`) per service.

Monitor disk usage: `docker system df`.

---

## PostgreSQL persistence

Volume `postgres_data` survives:

- `docker compose restart`
- `docker compose down` (without `-v`)
- container rebuilds

**Never run `docker compose down -v`** in normal deployment — it deletes the database volume.

---

## Production launch checklist

### Before deployment

- [ ] Domain DNS configured (A / AAAA verified)
- [ ] Server firewall: only 80, 443, 22 (SSH restricted if possible)
- [ ] Docker + Compose v2 installed
- [ ] `.env.production` created on server (`chmod 600`)
- [ ] Strong secrets generated (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`, SMTP)
- [ ] `ADMIN_PASSWORD` is not `admin123`
- [ ] SMTP configured and tested
- [ ] Real product/news images ready (production seed skips demo catalog)
- [ ] Legal pages reviewed by operator

### Deployment

- [ ] `git clone` to `/opt/sk-store` (or chosen path)
- [ ] Docker images built with `--env-file .env.production`
- [ ] PostgreSQL healthy
- [ ] `prisma migrate deploy` applied
- [ ] Production seed completed (`node dist/prisma/seed.js`)
- [ ] Backend + frontend healthy
- [ ] Nginx configured (`deploy/nginx/sk-store.conf.example`)
- [ ] HTTPS active (Let's Encrypt)

### Verification

- [ ] Public pages: `/`, `/products`, `/news`, `/contacts`, legal pages
- [ ] Admin login with production credentials
- [ ] Cart + order creation (server-side totals)
- [ ] Contact form submission
- [ ] Email delivery (if SMTP configured)
- [ ] `docker compose restart` — data persists
- [ ] First database backup created
- [ ] Ports 3001/5432 not reachable from Internet
- [ ] Port 3000 not reachable from Internet (only localhost)
- [ ] `/admin` and `/api` disallowed in robots.txt

---

## Development setup

See root `README.md` for install, migrate, seed, and dev start commands.

## Production security checklist

See [`docs/security.md`](./security.md). Minimum before public production:

- Strong `JWT_SECRET` and `POSTGRES_PASSWORD`
- `COOKIE_SECURE=true` with HTTPS
- Explicit `CORS_ORIGIN` matching public origin
- Strong `ADMIN_PASSWORD` in `.env.production` (production seed enforces this)
- Configure real SMTP
- Never commit `.env.production`
- PostgreSQL and backend not publicly exposed
