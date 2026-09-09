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
| `tags` | optional `string[]` (max 20); each tag 1–40 chars; empty/duplicates trimmed out |

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
6. creates `Order` + `OrderItem` snapshots in a single transaction with id `YYYYMMDD-N` (Europe/Minsk day + daily sequence);
7. sets `status` to `NEW` (client cannot set status);
8. after the transaction commits, sends order emails via `EmailService` (customer confirmation + business notification).

Request body:

| Field | Rules |
| --- | --- |
| `firstName` | required string, trimmed, 1–100 |
| `lastName` | required string, trimmed, 1–100 |
| `userEmail` | required email, trimmed |
| `userPhone` | required Belarus phone `+375XXXXXXXXX` |
| `comment` | optional string, trimmed, max 1000; empty omitted |
| `items` | non-empty array; unique `productId`s |
| `items[].productId` | required non-empty string (cuid) |
| `items[].quantity` | required integer, `1`–`1000` |

Unknown fields (including nested `price`, top-level `totalPrice`, `status`) are rejected by the global validation pipe (`forbidNonWhitelisted`).

Response (money as 2-decimal strings):

```json
{
  "id": "20260909-1",
  "status": "NEW",
  "totalPrice": "13.50",
  "comment": null,
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

Order ids are human-readable: `YYYYMMDD-N` in the Europe/Minsk calendar (example: first order on 9 Sep 2026 → `20260909-1`). Existing legacy cuid ids remain valid if present.

Snapshot semantics: `OrderItem` stores `productName`, `price`, `quantity`, `totalPrice` at order time. Later product edits do not change historical items. If a product is deleted, `OrderItem.productId` becomes `null` (`onDelete: SetNull`) while snapshot fields remain.

Errors: `400` validation / duplicate product IDs, `404` product not found, `429` when login-configured throttler limits are hit on this route, `500` unexpected.

Admin (HTTP-only auth cookie required):

- `GET /api/orders` — list orders (`createdAt` desc). Includes customer PII; **does not** include `items`.
- `GET /api/orders/:id` — order detail with customer PII + `items` snapshots; `404` if missing
- `PATCH /api/orders/:id/status` — body `{ "status": "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED" }`; returns full admin detail
- `DELETE /api/orders/:id` — hard delete (`204`); order items cascade

Admin list/detail fields (in addition to public create fields): `firstName`, `lastName`, `userEmail`, `userPhone`, `createdAt`, `updatedAt`. Detail also includes `items`.

> Public `POST /api/orders` response still **omits** customer PII. Admin endpoints are the only place that return contact fields.

Errors (admin): `400` validation, `401` unauthenticated, `404` missing order.

### Contact requests

Public (no authentication):

- `POST /api/contact-requests` — create contact request (`201`)

The client may send only contact fields. The server:

1. validates the payload;
2. rejects unknown fields including `status`, `id`, `createdAt`, `updatedAt` (`forbidNonWhitelisted`);
3. creates a `ContactRequest` with `status` always `NEW`;
4. returns a minimal safe payload.

Request body:

| Field | Rules |
| --- | --- |
| `firstName` | required string, trimmed, 1–100 |
| `lastName` | required string, trimmed, 1–100 |
| `phone` | required Belarus phone `+375XXXXXXXXX` |
| `email` | required email, trimmed, max 255 |
| `message` | required string, trimmed, 10–5000 |
| `consent` | required boolean, must be `true` (stored on the record) |

Response:

```json
{
  "id": "...",
  "status": "NEW",
  "createdAt": "2026-09-09T08:00:00.000Z"
}
```

Errors: `400` validation, `429` throttled (same Nest `ThrottlerGuard` / auth rate config as other public write routes), `500` unexpected.

Do not log full email, phone, or message. No email notification for contact requests in this phase.

Planned admin endpoints (JWT cookie; later Admin Contact Requests phase):

- `GET /api/contact-requests`
- `GET /api/contact-requests/:id`
- `PATCH /api/contact-requests/:id/status`

### Order email behavior

After a successful DB commit, the API attempts to send:

1. **Customer confirmation** — `to: Order.userEmail`, subject `Order confirmation #<id>`
2. **Business notification** — `to: ORDER_NOTIFICATION_EMAIL`, subject `New order #<id>`

Email content uses the persisted `Order` / `OrderItem` snapshot (not live product prices). HTML bodies escape user-visible strings; plain text is included as a fallback.

**Email delivery is independent of order persistence.** If SMTP/transport fails after the order is created, the API still returns `201` with the created order. Email failure is logged (order id + error message only; no SMTP password or full customer payload). Clients must not depend on email status in the response.

Admin order management endpoints are not part of this phase. Configure SMTP via environment variables (`SMTP_*`, `MAIL_FROM`, `ORDER_NOTIFICATION_EMAIL`). In local/dev without `SMTP_HOST`, Nodemailer `jsonTransport` is used (no external network).
