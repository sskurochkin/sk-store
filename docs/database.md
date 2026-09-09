# Database

PostgreSQL is the primary datastore. Access is through Prisma on the server.

Connection is configured via `DATABASE_URL` in `server/.env`.

## Models

- `Admin` — admin credentials (`username` unique; `passwordHash` only)
- `Product` — catalog item (`alias` unique; `gallery` as `String[]`; `price` as `Decimal(12,2)`)
- `News` — news article (`alias` unique; `content` as text/HTML)
- `Order` — customer order snapshot (`id` as `YYYYMMDD-N`; optional `comment`; `status` enum; `totalPrice` as `Decimal(12,2)`)
- `OrderItem` — relational line items with price/name snapshots
- `Social` — social network links

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

## Local commands

```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```
