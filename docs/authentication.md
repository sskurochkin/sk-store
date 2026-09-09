# Authentication

Admin authentication uses:

- bcrypt password verification against `Admin.passwordHash`
- JWT access token stored only in an HTTP-only cookie (`access_token` by default)
- `JwtAuthGuard` that reads the token from the cookie (not `Authorization` / localStorage)
- Nest `@nestjs/throttler` with **named** profiles:
  - `login` — `POST /api/auth/login` (`AUTH_LOGIN_RATE_LIMIT` / `AUTH_LOGIN_RATE_TTL_MS`)
  - `publicWrite` — `POST /api/orders` and `POST /api/contact-requests` (`PUBLIC_WRITE_RATE_LIMIT` / `PUBLIC_WRITE_RATE_TTL_MS`)

## Endpoints

- `POST /api/auth/login` — `{ username, password }` → sets cookie, returns `{ user: { id, username } }`
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — current admin (requires cookie)

Protected admin writes (for example product mutations) use `JwtAuthGuard`.

## Frontend (Phase 17)

Admin UI uses same-origin `/api/*` through a Next.js rewrite to Nest so the HTTP-only cookie is scoped to the Next host.

```text
Browser → Next `/api/auth/*` → rewrite → Nest Auth
```

- `/admin/login` — public login form
- `/admin/*` — middleware + server layout guard via `GET /api/auth/me`
- JWT is never stored in localStorage / sessionStorage / client state

## Cookie

- HttpOnly: always
- Secure: from `COOKIE_SECURE` (defaults to true in production)
- SameSite: from `COOKIE_SAME_SITE` (default `lax`)
- Max-Age: from `COOKIE_MAX_AGE_MS`

See also [`docs/security.md`](./security.md) for the Phase 25 checklist.
