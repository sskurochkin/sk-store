# Deployment

Local development expects:

- PostgreSQL on the host
- `server` on port 3001
- `frontend` on port 3000

## Frontend public URL (SEO)

Set `NEXT_PUBLIC_SITE_URL` in `frontend/.env.local` (documented in root `.env.example`).

- Local default / fallback: `http://localhost:3000`
- Production: the real public origin (no trailing slash), e.g. `https://shop.example.com`

Used for Next.js `metadataBase`, Open Graph absolute URLs, and canonical links.

Optional: `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` — comma-separated hostnames allowed by `next/image` (in addition to `example.com`).

## Production security checklist

See [`docs/security.md`](./security.md) for the full Phase 25 matrix. Minimum before production:

- Strong `JWT_SECRET` (not the example placeholder)
- `COOKIE_SECURE=true`
- Explicit `CORS_ORIGIN` matching the frontend origin (required when `NODE_ENV=production`)
- Change seed admin credentials (`admin` / `admin123` are bootstrap-only)
- Configure `AUTH_LOGIN_RATE_*` and `PUBLIC_WRITE_RATE_*`
- Never commit `.env` / `.env.local`
