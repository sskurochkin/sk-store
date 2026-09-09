# AGENTS.md — Cursor Rules for SK Store

## 1. Role and Source of Truth

You are working on **SK Store**, a bakery showcase and ordering website.

Before changing architecture or implementing a substantial feature:

1. Read `development_plan.md`.
2. Inspect the existing code.
3. Determine the current implementation phase.
4. Make the smallest change that satisfies the requirement.
5. Run the relevant quality checks.

`development_plan.md` is the architectural/product source of truth.

**Do not modify `development_plan.md` unless the user explicitly asks for it.**

If the requested change conflicts with the plan, explain the conflict and propose the smallest architectural adjustment before making a broad change.

---

## 2. Repository Boundaries

The repository is intentionally structured as:

```text
sk-store/
├── server/
├── frontend/
├── docs/
├── development_plan.md
├── AGENTS.md
├── .env.example
├── docker-compose.yml
└── README.md
```

### Important

- `server` and `frontend` are separate applications.
- Do not create `apps/`.
- Do not create `packages/`.
- Do not introduce a shared package just to avoid a small amount of duplication.
- Only introduce a shared package after a real, demonstrated need and explicit architectural approval.

### Ownership

**frontend**
- UI;
- browser interaction;
- cart state;
- API calls;
- presentation logic.

**server**
- business rules;
- authentication;
- authorization;
- validation;
- pricing;
- order calculations;
- database access;
- email delivery.

The server is authoritative.

---

## 3. Work Process

For every task:

### Step 1 — Inspect

Before editing:
- inspect relevant files;
- identify existing abstractions;
- search for similar implementations;
- check whether the feature already exists partially.

Do not rewrite a file simply because a different structure would be cleaner.

### Step 2 — Plan

For non-trivial work, identify:
- affected app (`frontend` / `server`);
- affected module;
- data/API impact;
- validation/security impact;
- cache/revalidation impact;
- tests required.

### Step 3 — Implement

Prefer:
- small changes;
- existing abstractions;
- reusable components/services;
- clear types;
- minimal dependencies.

### Step 4 — Verify

Run the most relevant checks:
- typecheck;
- lint;
- tests;
- build.

Do not claim a check passed unless it was actually run.

---

## 4. General Engineering Rules

Follow:

- DRY;
- SOLID;
- KISS;
- separation of concerns;
- explicit boundaries;
- composition over unnecessary inheritance;
- minimal dependencies.

Avoid:
- speculative abstractions;
- premature optimization;
- giant components;
- giant services;
- duplicated business rules;
- magic numbers/strings;
- `any`;
- dead code;
- unused imports;
- unnecessary libraries.

Do not overengineer.

If a simple solution is sufficient, use the simple solution.

---

## 5. TypeScript Rules

- Use strict TypeScript.
- Do not introduce `any`.
- Prefer explicit domain types.
- Do not use unsafe type assertions to silence compiler errors.
- Use discriminated unions/enums where they improve correctness.
- Keep API response/request types explicit.
- Do not duplicate the same type in many places if a local reusable type is appropriate.
- Avoid types that expose database implementation details directly to the public frontend.

If an external value is unknown, validate it instead of casting it.

---

## 6. Frontend Rules

### Next.js

Prefer:
- Server Components;
- SSR;
- server-side data fetching;
- static/revalidated rendering where appropriate.

Use Client Components only when necessary.

Good reasons for `"use client"` include:
- localStorage;
- cart interaction;
- quantity controls;
- checkout forms;
- authentication UI;
- interactive admin controls;
- rich text editor.

Do not turn an entire page into a Client Component just because one small child component needs browser state.

### Frontend architecture

Keep responsibilities separated:

```text
app/          route/page composition
components/   reusable UI
services/     API communication
hooks/        reusable client behavior
lib/          technical utilities
constants/    configurable/static values
types/        frontend/domain types
styles/       global styling
```

Do not put API calls directly into many unrelated components.

---

## 7. Public Styling

The public website should use:

- CSS Modules and/or standard CSS;
- CSS variables;
- reusable design tokens;
- semantic class names.

Do not introduce Tailwind into the public site without an explicit reason.

Admin styling may use Tailwind.

Keep public and admin styling concerns separate.

Prefer CSS variables for values likely to change:

```text
colors
spacing
border radius
container width
font sizes
breakpoints where practical
```

---

## 8. Cart Rules

The cart belongs to the frontend because it is a browser-local UX feature.

Use a single abstraction such as:

```text
CartProvider
useCart()

addItem()
removeItem()
updateQuantity()
clearCart()
getItemCount()
getTotal()
```

Do not scatter direct `localStorage` operations across components.

The cart may contain:
- product ID;
- quantity;
- minimal display information needed for UX.

The cart must never be considered authoritative for pricing.

The backend must reload current products and calculate the final order total.

---

## 9. Backend Rules

NestJS controllers must be thin.

Preferred flow:

```text
Controller
    ↓
Validation
    ↓
Service
    ↓
Prisma/data access
```

Controllers should:
- parse/receive input;
- call services;
- return responses.

Services should contain business logic.

Do not place substantial business rules in controllers.

Do not access Prisma directly from frontend-facing controllers if a service abstraction is appropriate.

---

## 10. Prisma and Database Rules

Prisma is the backend database abstraction.

Rules:

- migrations are committed;
- schema changes require migrations;
- do not manually edit an existing migration that may already have been applied;
- use transactions for multi-step operations that must be atomic;
- add appropriate indexes/unique constraints;
- use foreign keys/relations deliberately;
- do not store image binaries in PostgreSQL.

### Orders

Never model order items as an opaque `items[]` field when relational `OrderItem` provides the required historical integrity.

`OrderItem` must preserve snapshots:

```text
productName
price
quantity
totalPrice
```

This protects historical orders from future product edits.

---

## 11. Order and Pricing Rules

The backend is the source of truth.

Frontend submits:

```text
productId
quantity
```

Backend:
1. validates input;
2. loads products;
3. validates existence;
4. reads current database prices;
5. calculates item totals;
6. calculates final total;
7. creates `Order`;
8. creates `OrderItem` records;
9. commits the transaction.

Never trust:
- frontend price;
- frontend item total;
- frontend final total.

Do not duplicate authoritative pricing logic in the frontend.

---

## 12. Validation Rules

Validate on both sides.

Frontend:
- React Hook Form;
- Zod.

Backend:
- NestJS-compatible request validation/schema validation.

Server validation is mandatory even if the frontend already validates the same form.

Validate:
- required fields;
- email;
- phone;
- quantities;
- product IDs;
- aliases;
- admin credentials;
- order payloads;
- consent where required.

Validation errors should be explicit and user-safe.

---

## 13. Authentication and Security

Admin authentication must use secure HTTP-only cookies.

Never store admin authentication tokens in localStorage.

Required security properties:
- bcrypt password hashing;
- HTTP-only cookie;
- Secure cookie in production;
- appropriate SameSite setting;
- protected routes/guards;
- authorization checks;
- login rate limiting;
- correct CORS configuration;
- secrets only through environment/configuration.

Never log:
- passwords;
- password hashes;
- auth tokens;
- session secrets;
- sensitive customer information unnecessarily.

The initial seed credentials are:

```text
admin / admin123
```

Treat these as development/bootstrap credentials only. Production credentials must be changed/configured securely.

---

## 14. News HTML

News content can contain HTML.

Never render arbitrary HTML without sanitization.

If using a rich text editor:
- sanitize generated HTML before persistence and/or rendering;
- use an allowlist appropriate for the supported editor features;
- do not allow dangerous scripts/event-handler attributes.

Do not disable sanitization just to make an example work.

---

## 15. Images and Storage

Do not store image binaries in PostgreSQL.

Use a storage abstraction so the provider can be changed later.

The database should store:
- URL;
- storage key;
- or provider-neutral reference.

Image handling must support:
- main product photo;
- product gallery;
- main news photo.

Keep provider-specific code isolated.

---

## 16. Email

Email delivery belongs in a dedicated:

```text
EmailService
EmailModule
```

Do not send emails directly from random controllers/components.

The email provider must be configurable.

Order emails should include:
- order identification;
- customer information appropriate for the message;
- ordered products;
- quantities;
- prices;
- total;
- relevant status/next-step information.

If email delivery fails, handle the failure deliberately; do not silently hide infrastructure errors.

---

## 17. API Rules

Initial API:

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /products
GET    /products/:alias
POST   /products
PATCH  /products/:id
DELETE /products/:id

GET    /news
GET    /news/:alias
POST   /news
PATCH  /news/:id
DELETE /news/:id

POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id/status
DELETE /orders/:id

POST   /contact-requests
GET    /contact-requests
GET    /contact-requests/:id
PATCH  /contact-requests/:id/status

GET    /socials
POST   /socials
PATCH  /socials/:id
DELETE /socials/:id
```

`POST /contact-requests` is public (rate-limited). Admin contact-request endpoints require JWT (later Admin phase).

Protected admin endpoints must be guarded.

Do not expose admin-only data through public endpoints.

Use consistent HTTP semantics and error responses.

---

## 18. Cache and Revalidation

Admin mutations must invalidate affected public data.

Use tags such as:

```text
products
product:{id}
product:alias:{alias}

news
news:{id}
news:alias:{alias}

socials
settings
```

When a product/news entity changes, consider:
- collection cache;
- ID detail cache;
- alias detail cache.

Do not leave known stale public data after an admin mutation.

---

## 19. SEO and Performance

Use Next.js metadata APIs.

Implement:
- page titles;
- descriptions;
- Open Graph metadata;
- canonical URLs where applicable.

Prefer server rendering.

Avoid unnecessary:
- client components;
- client-side fetching;
- JavaScript;
- dependencies.

Use optimized image handling.

Future work may include:
- sitemap;
- robots.txt;
- JSON-LD.

Do not build these prematurely if they are outside the current phase.

---

## 20. Configuration and Constants

User-changeable or environment-dependent values must not be scattered through source code.

Examples:
- API URL;
- email provider;
- storage provider;
- pagination limits;
- cookie settings;
- rate-limit values;
- site metadata;
- social configuration;
- status display labels.

Use:
- environment variables for secrets/deployment settings;
- typed configuration;
- constants for stable application values.

Never commit secrets.

`.env.example` documents required variables without real secrets.

Actual environment files remain local to the relevant application.

---

## 21. Dependencies

Before adding a dependency:

1. Check whether the current stack already solves the problem.
2. Check whether the feature can be implemented simply with existing code.
3. Add a dependency only when it provides meaningful value.

Avoid:
- duplicate libraries;
- utility packages for trivial functions;
- framework overlap;
- unnecessary UI libraries.

When adding a dependency, update the appropriate `package.json` and lockfile.

---

## 22. Testing

Test business-critical behavior.

Priority areas:
- authentication;
- product CRUD;
- news CRUD;
- order creation;
- order total calculation;
- order status changes;
- validation;
- cart behavior;
- cache invalidation;
- critical public/admin flows.

For order tests, verify that frontend-supplied totals cannot manipulate the server-side total.

Do not reduce production validation merely to make tests pass.

---

## 23. Quality Gates

Before considering a meaningful task complete, run relevant checks:

```text
typecheck
lint
tests
build
```

Not every tiny documentation change requires every check, but code changes should be verified appropriately.

Before MVP completion:

- clean install;
- migrations;
- seed;
- production build;
- critical E2E flows.

Never report a command as successful unless it was actually executed.

---

## 24. Git and File Hygiene

Do not commit:
- `.env`;
- `.env.local`;
- secrets;
- generated credentials;
- temporary debug files;
- build output;
- local database files;
- unrelated formatting changes.

Keep diffs focused.

Do not rewrite unrelated files.

Do not perform broad refactors during a feature task unless necessary.

---

## 25. Documentation

Update documentation when behavior or architecture changes materially.

Relevant documentation belongs in:

```text
docs/
├── architecture.md
├── database.md
├── api.md
├── authentication.md
├── deployment.md
└── decisions/
```

Do not modify `development_plan.md` unless explicitly instructed.

For architectural decisions, prefer a short decision record under `docs/decisions/`.

---

## 26. Do Not Invent Requirements

If a requirement is ambiguous:

- use the smallest reasonable interpretation;
- preserve existing behavior;
- avoid introducing additional business rules;
- ask for clarification only when the ambiguity materially affects architecture, security, data integrity, or user-visible behavior.

Do not invent:
- payment processing;
- customer accounts;
- loyalty systems;
- inventory;
- delivery logistics;
- complex analytics;
- unnecessary roles/permissions.

These are outside the MVP unless explicitly requested.

---

## 27. Definition of Done

A task is complete when:

- implementation matches the requirement;
- architecture boundaries are preserved;
- types are correct;
- validation exists where required;
- security implications are handled;
- relevant cache invalidation is implemented;
- tests/checks are run;
- no unnecessary dependencies were added;
- no unrelated files were changed.

---

## 28. Completion Report

After completing a non-trivial task, report briefly:

```text
Implemented:
- ...

Files changed:
- ...

Validation:
- typecheck: passed/failed/not run
- lint: passed/failed/not run
- tests: passed/failed/not run
- build: passed/failed/not run

Notes:
- ...
```

If something was intentionally not implemented, state why.

