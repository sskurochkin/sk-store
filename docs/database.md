# Database

PostgreSQL is the primary datastore. Access is through Prisma on the server.

Connection is configured via `DATABASE_URL` in `server/.env`.

## Models

- `Admin` — admin credentials (`username` unique; `passwordHash` only)
- `Product` — catalog item (`alias` unique; `gallery` as `String[]`; `price` as `Decimal(12,2)`)
- `News` — news article (`alias` unique; `content` as text/HTML; optional `tags: String[]`)
- `Order` — customer order snapshot (`id` as `YYYYMMDD-N`; optional `comment`; `status` enum; `totalPrice` as `Decimal(12,2)`)
- `OrderItem` — relational line items with price/name snapshots
- `Social` — social network links
- `ContactRequest` — public contact form submissions (`consent` boolean; `status` enum; indexes on `status`, `createdAt`)

## OrderItem integrity

`OrderItem` stores `productName`, `price`, `quantity`, and `totalPrice` snapshots.

`productId` is nullable with `onDelete: SetNull`, so deleting a product does not destroy historical order lines.

## Order status

```text
NEW
PROCESSING
COMPLETED
CANCELLED
```

## ContactRequest status

```text
NEW
IN_PROGRESS
COMPLETED
CANCELLED
```

Default on create: `NEW`. Status changes are admin-only (future phase). Records are retained.

## Local commands

```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```
