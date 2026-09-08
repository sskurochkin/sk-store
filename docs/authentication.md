# Authentication

Admin authentication uses:

- bcrypt password verification against `Admin.passwordHash`
- JWT access token stored only in an HTTP-only cookie (`access_token` by default)
- `JwtAuthGuard` that reads the token from the cookie (not `Authorization` / localStorage)
- login-only rate limiting via `@nestjs/throttler`

## Endpoints

- `POST /api/auth/login` — `{ username, password }` → sets cookie, returns `{ user: { id, username } }`
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — current admin (requires cookie)
- `GET /api/auth/guard-check` — temporary protected probe for Phase 4 tests

## Cookie

- HttpOnly: always
- Secure: from `COOKIE_SECURE` (defaults to true in production)
- SameSite: from `COOKIE_SAME_SITE` (default `lax`)
- Max-Age: from `COOKIE_MAX_AGE_MS`
