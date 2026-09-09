# Security

Phase 25 security review snapshot for SK Store MVP.

## Control status

| Area | Status | Notes |
| --- | --- | --- |
| bcrypt password hashing | OK | Login `compare`; seed `hash(..., 10)` |
| JWT in HTTP-only cookie | OK | Cookie-only strategy; not `Authorization` / localStorage |
| Cookie Secure / SameSite | OK | Secure defaults true in production; SameSite default `lax` |
| JwtAuthGuard on admin APIs | OK | Products, news, orders, contact-requests, socials writes/reads as designed |
| ValidationPipe | OK | `whitelist` + `forbidNonWhitelisted` + `transform` |
| CORS | OK (hardened) | Production requires explicit `CORS_ORIGIN` (no reflect-any / `*`) |
| Rate limiting | OK (split) | Named throttlers: `login` vs `publicWrite` (orders + contact) |
| News HTML sanitization | OK | `sanitizeNewsHtml` on create/update; narrow allowlist |
| Contact abuse controls | OK | `consent: true`, throttle, public response `{ id, status, createdAt }` only |
| Order pricing | OK | Server Decimal totals; client prices rejected |
| Secrets in Git | OK | `.env` / `.env.local` gitignored; examples are placeholders |
| Sensitive logging | OK | No password / JWT / full contact message dumps |
| Frontend admin gate | OK | Middleware + layout `getCurrentUser`; JWT never in localStorage |

## Rate limit env

| Variable | Applies to | Default |
| --- | --- | --- |
| `AUTH_LOGIN_RATE_LIMIT` / `AUTH_LOGIN_RATE_TTL_MS` | `POST /api/auth/login` | 5 / 60000 |
| `PUBLIC_WRITE_RATE_LIMIT` / `PUBLIC_WRITE_RATE_TTL_MS` | `POST /api/orders`, `POST /api/contact-requests` | 5 / 60000 |

## Production checklist

- [ ] Set a long random `JWT_SECRET` (not the example placeholder)
- [ ] `COOKIE_SECURE=true`
- [ ] `CORS_ORIGIN` = exact frontend origin (e.g. `https://shop.example.com`)
- [ ] `CORS_CREDENTIALS=true`
- [ ] Change seed admin password (`admin` / `admin123` is bootstrap-only)
- [ ] Do not commit `.env` / `.env.local`
- [ ] Confirm SMTP secrets are not logged
- [ ] Tune `AUTH_LOGIN_*` and `PUBLIC_WRITE_*` for expected traffic

## Residual ops risks (not code gaps)

- Bootstrap credentials must be rotated before public production use
- Throttling is in-memory per Nest process (multi-instance needs a shared store later)
- No captcha / WAF in MVP — rely on throttle + validation

## Intentionally out of scope (MVP)

- Helmet / CSP overhaul
- CSRF tokens (same-origin cookie rewrite + SameSite=lax)
- Client-side re-sanitize of news HTML (write-path is authoritative)
- Captcha / WAF
