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

### News

Public:

- `GET /api/news` — list news (`createdAt` desc)
- `GET /api/news/:alias` — news by alias; `404` if missing

Admin (HTTP-only auth cookie required):

- `POST /api/news` — create (`201`)
- `PATCH /api/news/:id` — partial update
- `DELETE /api/news/:id` — hard delete (`204`)

Create/update body fields:

| Field | Rules |
| --- | --- |
| `title` | string, 1–200 chars |
| `alias` | lowercase slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique |
| `description` | plain text string |
| `mainPhoto` | non-empty string (URL / storage reference) |
| `content` | HTML string; sanitized on write before persistence |

HTML sanitization (`sanitize-html`) allowlist:

- tags: `p`, `br`, `strong`, `em`, `u`, `ul`, `ol`, `li`, `a`, `h2`, `h3`, `blockquote`
- `a[href]`: `http`, `https`, `mailto` only
- stripped: `script`, `iframe`, event handlers, `javascript:` URLs, etc.

Errors: `400` validation, `401` unauthenticated write, `404` missing news, `409` alias conflict.

### Socials (MVP settings retrieval)

Public:

- `GET /api/socials` — list social links ordered by `name` asc (public settings for footer/contacts)

Admin (HTTP-only auth cookie required):

- `POST /api/socials` — create (`201`)
- `PATCH /api/socials/:id` — partial update
- `DELETE /api/socials/:id` — hard delete (`204`)

Create/update body fields:

| Field | Rules |
| --- | --- |
| `name` | string, 1–100 chars |
| `link` | `http` or `https` URL (protocol required) |
| `icon` | non-empty string (icon name / URL / storage key), not binary |

Errors: `400` validation, `401` unauthenticated write, `404` missing social.

There is no separate Settings module in MVP — social networks are the initial settings scope.

### Orders

Public (no authentication):

- `POST /api/orders` — create order (`201`)

> **Client-provided `price` and `totalPrice` are never trusted.**

The client may send only product IDs + quantities and customer contact fields. The server:

1. validates the payload;
2. rejects duplicate `productId` values in `items` (`400`);
3. loads current products from PostgreSQL;
4. returns `404` if any product is missing;
5. calculates line totals and order total from current `Product.price` using Prisma `Decimal` arithmetic;
6. creates `Order` + `OrderItem` snapshots in a single transaction;
7. sets `status` to `NEW` (client cannot set status).

Request body:

| Field | Rules |
| --- | --- |
| `firstName` | required string, trimmed, 1–100 |
| `lastName` | required string, trimmed, 1–100 |
| `userEmail` | required email, trimmed |
| `userPhone` | required string, trimmed, 5–32 chars |
| `items` | non-empty array; unique `productId`s |
| `items[].productId` | required non-empty string (cuid) |
| `items[].quantity` | required integer, `1`–`1000` |

Unknown fields (including nested `price`, top-level `totalPrice`, `status`) are rejected by the global validation pipe (`forbidNonWhitelisted`).

Response (money as 2-decimal strings):

```json
{
  "id": "...",
  "status": "NEW",
  "totalPrice": "13.50",
  "items": [
    {
      "productId": "...",
      "productName": "Croissant",
      "price": "4.50",
      "quantity": 3,
      "totalPrice": "13.50"
    }
  ]
}
```

Snapshot semantics: `OrderItem` stores `productName`, `price`, `quantity`, `totalPrice` at order time. Later product edits do not change historical items. If a product is deleted, `OrderItem.productId` becomes `null` (`onDelete: SetNull`) while snapshot fields remain.

Errors: `400` validation / duplicate product IDs, `404` product not found, `429` when login-configured throttler limits are hit on this route, `500` unexpected.

Email confirmation is **not** sent in this phase (Phase 9). Admin order management endpoints are not part of this phase.
