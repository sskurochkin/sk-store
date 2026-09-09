# SK Store

Bakery showcase and ordering website.

## Structure

- `frontend` — Next.js (TypeScript)
- `server` — NestJS (TypeScript) + Prisma
- `docs` — project documentation

PostgreSQL is expected to run locally on the host. Docker Compose does **not** create a PostgreSQL container.

## Prerequisites

- Node.js 20+
- PostgreSQL with a database matching `DATABASE_URL`

## Setup

### Server

```bash
cd server
cp ../.env.example .env   # or ensure DATABASE_URL is set
npm install
npx prisma generate
npm run start:dev
```

Default API port: `3001`

### Frontend

```bash
cd frontend
cp ../.env.example .env.local   # adjust NEXT_PUBLIC_API_URL as needed
npm install
npm run dev
```

Default frontend port: `3000`

## Quality checks

```bash
# frontend
cd frontend && npm run typecheck && npm run lint && npm run build

# server
cd server && npm run typecheck && npm run lint && npm run build
```

## Phase

Current focus: **Phase 17 — Admin UI Foundation** completed (login/logout, protected `/admin`, same-origin `/api` rewrite).

Public pages: `/`, `/products`, `/news`, `/contacts`, `/cart`.

Admin: `/admin/login`, `/admin` (dashboard). CRUD modules come later.

Browser API calls use same-origin `/api/*` (Next.js rewrite → NestJS). `NEXT_PUBLIC_API_URL` is the Nest origin for rewrites and server-side fetches.
