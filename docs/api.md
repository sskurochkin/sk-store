# API

REST API is served by the NestJS application under `/api`.

## Available now

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/login` — `{ username, password }` → sets HTTP-only cookie, returns `{ user: { id, username } }`
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — current admin (requires cookie)

### Products

Public:

- `GET /api/products` — list products (`createdAt` desc). Price is a string with 2 decimal places.
- `GET /api/products/:alias` — product by alias; `404` if missing

Admin (HTTP-only auth cookie required):

- `POST /api/products` — create product (`201`)
- `PATCH /api/products/:id` — partial update
- `DELETE /api/products/:id` — hard delete (`204`)

Create/update body fields:

| Field | Rules |
| --- | --- |
| `name` | string, 1–200 chars |
| `alias` | lowercase slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique |
| `description` | string |
| `mainPhoto` | non-empty string (URL / storage reference) |
| `gallery` | optional `string[]` (default `[]`) |
| `price` | number `> 0`, max 2 decimal places |

Errors: `400` validation, `401` unauthenticated write, `404` missing product, `409` alias conflict.

Domain CRUD for news, orders, and socials arrives in later phases.
