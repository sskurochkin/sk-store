# Deployment

> **Русская инструкция:** подробное пошаговое руководство по Docker-деплою, обновлению и troubleshooting — [`docker-deployment-ru.md`](./docker-deployment-ru.md).

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
| `.github/workflows/ci.yml` | Lint, typecheck, test, build on PR/push |
| `.github/workflows/deploy.yml` | Production deploy to VPS on push to `main` |

**Do not use `docker compose down -v`** in normal operations — `-v` deletes the `postgres_data` volume.

---

## CI/CD (GitHub Actions)

```text
PR / push → CI (frontend + server checks)
merge to main → Deploy (SSH → pull → backup → build → migrate → up)
```

Workflow files live in `.github/workflows/`. Configure once in the GitHub repository settings; `.env.production` stays on the server only.

### CI (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main`:

| Job | Checks |
| --- | --- |
| **Frontend** | `typecheck`, `lint`, `build` |
| **Server** | `prisma generate`, `typecheck`, `lint`, `build`, `npm test` |

Optional repository variable (Settings → Secrets and variables → Actions → Variables):

| Variable | Default in workflow | Purpose |
| --- | --- | --- |
| `CI_NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Frontend build in CI (not production URL) |

### CD (`.github/workflows/deploy.yml`)

Runs on push to `main` and via **Actions → Deploy → Run workflow** (`workflow_dispatch`).

Uses GitHub Environment **`production`** — enable **Required reviewers** under Settings → Environments for manual approval before deploy.

Deploy steps on the VPS (Actions):

1. PostgreSQL backup (best-effort) via `pg_dump -f` inside the container + `docker compose cp`
2. **Single SSH step:** `git pull` → `deploy/deploy-prod.sh` (conditional build/recreate)
   - Compares current commit to `.deploy-last-commit` on the server
   - **Frontend build** only if `frontend/` changed
   - **Backend build** only if `server/` changed
   - **Migrate** only if `server/` changed
   - **Recreate containers** only for services that were rebuilt, retagged, or affected by `docker-compose.prod.yml` changes
   - If the commit is unchanged, exits immediately (no build)
   - Images tagged `sk-store-prod-frontend:$GIT_COMMIT` / `sk-store-prod-backend:$GIT_COMMIT`
   - Manual **Actions → Deploy → Run workflow** supports **Force rebuild** (`FORCE_BUILD=1`)
3. Smoke test homepage + `/api/health` (retries; warnings only on failure)

Manual deploy on the server (same logic as CI):

```bash
cd /home/deploy/sk-store
git pull --ff-only origin main
bash deploy/deploy-prod.sh
```

Force full rebuild (e.g. after Docker cache issues):

```bash
FORCE_BUILD=1 bash deploy/deploy-prod.sh
```

The script uses `--env-file .env.production` via `docker-compose.prod.yml`. Server state file `.deploy-last-commit` is gitignored and created on first successful deploy.

### GitHub secrets (required for deploy)

Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Example | Notes |
| --- | --- | --- |
| `DEPLOY_HOST` | `130.49.141.216` | VPS IP or domain |
| `DEPLOY_USER` | `deploy` | SSH user with Docker access |
| `DEPLOY_PATH` | `/home/deploy/sk-store` | Absolute path to repo clone on server |
| `DEPLOY_SSH_KEY_B64` | base64 one-liner | **Recommended** — avoids multiline paste issues |
| `DEPLOY_SSH_KEY` | OpenSSH private key | Alternative: full `-----BEGIN OPENSSH PRIVATE KEY-----` … block |

Use **either** `DEPLOY_SSH_KEY_B64` **or** `DEPLOY_SSH_KEY` (not the `.pub` file).

Encode private key for GitHub (macOS):

```bash
base64 < ~/.ssh/sk-store-deploy | tr -d '\n' | pbcopy
```

Linux:

```bash
base64 -w 0 ~/.ssh/sk-store-deploy
```

Paste the output into secret `DEPLOY_SSH_KEY_B64`.

Raw key (if not using base64):

```bash
cat ~/.ssh/sk-store-deploy | pbcopy   # macOS
```

The secret must include `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` with line breaks preserved. Do **not** wrap the value in quotes.

If deploy fails with `ssh: no key found` or `ParsePrivateKey`, the secret is empty, corrupted, or contains the **public** key — re-create `DEPLOY_SSH_KEY_B64` from the private file.

Never commit `.env.production` or private keys to the repository.

### Server setup for deploy user

On the VPS (once):

```bash
adduser deploy
usermod -aG docker deploy

mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
# Append deploy public key (from ssh-keygen) to authorized_keys:
cat sk-store-deploy.pub >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Generate deploy key pair locally (private → `DEPLOY_SSH_KEY`, public → server `authorized_keys`):

```bash
ssh-keygen -t ed25519 -C "github-actions-sk-store" -f ~/.ssh/sk-store-deploy -N ""
```

Verify SSH login:

```bash
ssh -i ~/.ssh/sk-store-deploy deploy@YOUR_VPS_IP
```

Clone or move the project so `DEPLOY_PATH` matches, e.g. `/home/deploy/sk-store`, with `.env.production` (`chmod 600`) already configured.

### Branch protection (recommended)

For `main`: require pull request, require CI status checks (`Frontend`, `Server`), disallow force-push.

### Manual deploy (fallback)

Same commands as the workflow — see [Update deployment](#update-deployment) below.

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

When [CI/CD](#cicd-github-actions) is configured, merging to `main` runs this automatically. Otherwise deploy manually:

1. **Backup database first** (see Backup above).
2. Pull code and review new migrations.
3. Build and migrate:

```bash
git pull --ff-only origin main
bash deploy/deploy-prod.sh
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

`API_INTERNAL_URL=http://backend:3001` is set in `docker-compose.prod.yml` (build args + frontend runtime env) and `frontend/Dockerfile` (server-only, not in client bundle). Required for middleware `/admin` auth checks.

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

## Media file storage (Phase 30A)

Uploaded images are stored on the **backend filesystem**, not in PostgreSQL.

| Item | Value |
| --- | --- |
| Container path | `/app/public/media` |
| Docker volume | `media_data` (backend service only) |
| Public URL | `/media/<filename>` (served by Nest/Express static middleware) |
| Max upload size | `MEDIA_MAX_FILE_SIZE` (default `10485760` = 10 MB) |

Environment (backend):

```text
MEDIA_MAX_FILE_SIZE=10485760
MEDIA_UPLOAD_RATE_LIMIT=10
MEDIA_UPLOAD_RATE_TTL_MS=60000
# Optional override for non-default storage path:
# MEDIA_STORAGE_DIR=/app/public/media
```

**Backup:** PostgreSQL backup alone is **not** sufficient. Back up both:

1. PostgreSQL (`postgres_data` / `pg_dump`)
2. Media files (`media_data` volume — e.g. archive `/app/public/media` from the backend container)

**Restore:** restore DB and media volume (or copied files) together; Media DB rows reference `/media/...` paths.

**Production routing:** Nginx/frontend currently proxy public traffic to Next.js. To expose `/media/*` from the backend in production, add a reverse-proxy rule to the backend (or a Next.js rewrite to `http://backend:3001/media/*`). Direct access to backend `:3001` from the Internet must remain blocked.

The backend entrypoint ensures `/app/public/media` exists and is writable by the `nestjs` runtime user before starting the app.

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

- [ ] GitHub Actions secrets configured (`DEPLOY_*`) if using CI/CD
- [ ] Deploy user in `docker` group; SSH key in `authorized_keys`
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
