# SK Store — Development Plan

## 1. Project Overview

**SK Store** is a bakery product showcase and ordering website.

The public site allows visitors to:
- browse bakery products;
- open individual product pages;
- add products to a cart;
- change quantities and remove items;
- submit an order without online payment;
- read news;
- view contacts and social networks;
- submit a contact request form on `/contacts`.

The admin area allows the administrator to:
- log in;
- manage products;
- manage news;
- manage orders and their statuses;
- manage contact requests and their statuses;
- manage social networks/settings;
- prepare a foundation for future statistics.

### Reference websites

The visual and UX direction may be informed by:
- laposte.ru
- lafamiliacake.ru
- xn--80ajpngj0i.xn--80adxhks
- buhanka.ru

These are references, not requirements for copying their design.

---

## 2. Core Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- SSR / React Server Components as the default
- CSS Modules / standard CSS for the public website
- CSS variables for design tokens
- Tailwind CSS only for the admin interface where it provides clear value
- React Hook Form + Zod for forms and validation
- localStorage for the shopping cart

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Zod and/or NestJS-compatible validation at API boundaries
- bcrypt for password hashing

### Infrastructure

- PostgreSQL
- Docker Compose for local development where useful
- Configurable email provider
- Configurable object/image storage
- Environment variables for secrets and deployment-specific settings

---

## 3. Repository Structure

The project is intentionally split into two independent applications.

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

Do **not** introduce `apps/` or `packages/` unless there is a real architectural need and the decision is explicitly approved.

### Server

```text
server/
├── src/
│   ├── auth/
│   ├── admins/
│   ├── products/
│   ├── news/
│   ├── orders/
│   ├── contact-requests/
│   ├── socials/
│   ├── email/
│   ├── prisma/
│   ├── config/
│   ├── common/
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
├── package.json
├── tsconfig.json
└── .env
```

### Frontend

```text
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── news/
│   │   ├── contacts/
│   │   ├── cart/
│   │   ├── admin/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── news/
│   │   ├── cart/
│   │   └── forms/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── constants/
│   ├── types/
│   └── styles/
├── public/
├── package.json
├── tsconfig.json
└── .env.local
```

### Documentation

```text
docs/
├── architecture.md
├── database.md
├── api.md
├── authentication.md
├── deployment.md
└── decisions/
```

---

## 4. Architecture Principles

The project follows:

- DRY
- SOLID
- KISS
- separation of concerns
- explicit boundaries
- minimal dependencies
- security over convenience

### Application boundaries

`frontend`:
- renders UI;
- handles browser interactions;
- owns cart state;
- calls backend APIs;
- must not contain authoritative business rules.

`server`:
- owns business logic;
- owns database access;
- owns authentication;
- validates and calculates orders;
- is the source of truth for prices and totals;
- sends emails.

The frontend must never be trusted for:
- product prices;
- order totals;
- order status;
- authorization;
- sensitive business rules.

---

## 5. Data Model

### Admin

```text
Admin
- id
- username
- passwordHash
- createdAt
- updatedAt
```

Initial seed account:

```text
username: admin
password: admin123
```

The password must only be stored as a bcrypt hash.

### Product

```text
Product
- id
- name
- alias
- description
- mainPhoto
- gallery[]
- price
- createdAt
- updatedAt
```

`alias` is used for human-readable URLs.

### News

```text
News
- id
- title
- alias
- description
- mainPhoto
- content
- createdAt
- updatedAt
```

`alias` is used for `/news/[alias]`.

`content` may contain HTML, but HTML must be sanitized before persistence and/or rendering.

### Order

```text
Order
- id
- firstName
- lastName
- userEmail
- userPhone
- totalPrice
- status
- createdAt
- updatedAt
```

There is no full customer account system in the MVP.

Customer data is stored as an order snapshot.

### OrderItem

Use a relational `OrderItem` instead of storing `Order.items[]` as an opaque array.

```text
OrderItem
- id
- orderId
- productId
- productName
- price
- quantity
- totalPrice
```

The snapshot fields are important because product name/price may change after an order is placed.

### Social

```text
Social
- id
- name
- link
- icon
```

### ContactRequest

Public contact form submissions are stored as a separate resource (not linked to Admin/User accounts).

```text
ContactRequest
- id
- firstName
- lastName
- phone
- email
- message
- consent
- status
- createdAt
- updatedAt
```

`consent` must be `true` on create and is stored for audit. Phone uses Belarus format `+375XXXXXXXXX` (same as checkout).
Status enum:

```text
NEW
IN_PROGRESS
COMPLETED
CANCELLED
```

Rules:
- public `POST` creates a request with status always `NEW` (client cannot set status);
- records are retained (no automatic deletion);
- admin list / detail / status change is a later Admin phase;
- do not log full email, phone, or message in ordinary application logs.

---

## 6. Order Rules

The backend is the source of truth.

The frontend sends:

```text
productId + quantity
```

The backend:
1. loads products from PostgreSQL;
2. validates product existence;
3. validates quantity;
4. uses current server-side prices;
5. calculates item totals;
6. calculates the final order total;
7. creates the order and order items in a transaction;
8. sends the customer email.

Never trust a frontend-provided:
- price;
- item total;
- final total.

Recommended status enum:

```text
NEW
PROCESSING
COMPLETED
CANCELLED
```

Human-readable labels must be kept separate from enum values.

---

## 7. Authentication

Admin authentication should use a secure HTTP-only cookie.

Do not store authentication JWTs/tokens in localStorage.

Requirements:
- bcrypt password hashing;
- HTTP-only cookie;
- Secure cookie in production;
- appropriate SameSite policy;
- authentication guard for protected backend endpoints;
- admin authorization checks;
- login rate limiting;
- no secrets in source control.

Initial admin credentials are seed data only and must be configurable/replaced for production.

---

## 8. Validation

Validation is required on both client and server.

Use:
- React Hook Form + Zod for frontend forms;
- server-side DTO/schema validation for API input.

Never rely on frontend validation for security.

Validate at minimum:
- required fields;
- email format;
- phone format;
- quantity bounds;
- prices/IDs from trusted database state;
- aliases;
- admin credentials;
- order payloads;
- contact request payloads (name, phone, email, message length).

---

## 9. Public Pages

Required routes:

```text
/
 /products/[alias]
 /news
 /news/[alias]
 /contacts
 /cart
```

The header should include a mini-cart with item count.

Clicking it opens `/cart`.

### Public rendering strategy

Prefer:
- Server Components;
- SSR;
- server-side data fetching;
- static/revalidated content where appropriate.

Use Client Components only where browser state or interaction is required, such as:
- cart/localStorage;
- quantity controls;
- checkout form;
- admin login;
- interactive admin screens;
- rich text editor.

---

## 10. Cart

Cart state is stored in `localStorage`.

Access to localStorage must be centralized.

Recommended abstraction:

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

Do not scatter direct `localStorage` calls across components.

The cart total is for UX only. The backend recalculates the actual order total.

---

## 11. Checkout

Checkout must contain:

- first name;
- last name;
- email;
- phone;
- consent to personal-data processing.

On submit:
1. validate client-side;
2. send product IDs + quantities + customer data;
3. validate everything on the server;
4. recalculate prices;
5. create order transactionally;
6. make the order visible in admin;
7. send an email containing the order composition.

No online payment is required for the MVP.

Email delivery must be isolated behind an `EmailService` / `EmailModule` so the provider can be changed later.

---

## 12. Admin

### Login

```text
/admin
```

After successful login:

```text
/dashboard
```

### Sections

- Settings
- Products
- News
- Orders
- Contact Requests (`/admin/contact-requests`)
- Statistics

### List tables UX

Shared admin list behavior:
- delete actions require an accessible confirmation modal (not `window.confirm`);
- tables paginate client-side with page size from `ADMIN_TABLE_PAGE_SIZE` (`frontend/src/constants/admin-table.ts`, default `3`);
- Orders and Contact Requests tables support column sorting (status, date, client; Orders also sum).

### Settings

Initial scope:
- social networks.

Keep the design extensible for future settings.

### Products

Admin can:
- create;
- edit;
- delete;
- manage main photo;
- manage gallery;
- update price;
- update description;
- update alias.

### News

Admin can:
- create;
- edit;
- delete;
- update title;
- update alias;
- update description;
- update main photo;
- edit rich content.

Rich content may produce HTML, but it must be sanitized.

### Orders

Admin can:
- view orders;
- inspect order items;
- inspect customer data;
- change status;
- delete orders.

### Contact Requests

Admin can (Admin UI):
- view contact request list;
- open a single request;
- change status (`NEW` → `IN_PROGRESS` → `COMPLETED`, or `CANCELLED`);
- delete a request (manual; no automatic purge).

Planned admin API (JWT cookie required; same path convention as other admin resources):

```text
GET    /contact-requests
GET    /contact-requests/:id
PATCH  /contact-requests/:id/status
DELETE /contact-requests/:id
```

### Statistics

MVP foundation only.

Prepare the architecture for a future monthly revenue chart without implementing unnecessary analytics infrastructure now.

---

## 13. API

Initial API shape:

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
DELETE /contact-requests/:id

GET    /socials
POST   /socials
PATCH  /socials/:id
DELETE /socials/:id
```

`POST /contact-requests` is public (no JWT), rate-limited, and always creates `status: NEW`.
Admin contact-request list/detail/status/delete endpoints require JWT.

Protected endpoints must be explicitly guarded.

Controllers should remain thin; business logic belongs in services.

---

## 14. Images and Files

Do not store binary images directly in PostgreSQL.

Use an object-storage abstraction.

Database fields should store:
- URL;
- object key;
- or another provider-neutral reference.

The actual storage provider can be selected later through configuration.

---

## 15. Caching and Revalidation

After admin mutations, invalidate/revalidate relevant cached content.

Recommended cache tags:

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

A product or news mutation must invalidate both collection and relevant detail data.

Avoid stale public content after admin changes.

---

## 16. Styling

### Public site

Use:
- CSS Modules or standard CSS;
- CSS variables;
- semantic class names;
- reusable UI primitives.

Do not introduce Tailwind into the public site unless there is a concrete architectural reason.

### Admin

Tailwind may be used for faster dashboard development.

Do not let admin styling conventions leak into the public design system.

---

## 17. SEO and Performance

Use Next.js capabilities for:

- dynamic metadata;
- Open Graph metadata;
- canonical URLs;
- appropriate headings;
- optimized images;
- SSR/server rendering.

Future improvements:
- sitemap;
- robots.txt;
- JSON-LD structured data.

Avoid unnecessary client-side JavaScript.

---

## 18. Security Requirements

Before MVP completion verify:

- bcrypt password hashing;
- secure admin cookies;
- authentication guards;
- authorization checks;
- login rate limiting;
- CORS configuration;
- server-side validation;
- HTML sanitization;
- server-side order totals;
- transactional order creation;
- safe database queries through Prisma;
- secrets excluded from Git;
- production environment variables;
- no sensitive data in logs.

---

## 19. Development Phases

### Phase 0 — Planning
- repository structure;
- architecture;
- requirements;
- environment strategy.

### Phase 1 — Infrastructure
- Next.js app;
- NestJS app;
- PostgreSQL;
- Docker Compose if useful;
- environment configuration.

### Phase 2 — Database
- Prisma schema;
- migrations;
- seed;
- admin account.

### Phase 3 — Backend Foundation
- NestJS modules;
- Prisma service;
- configuration;
- error handling;
- validation.

### Phase 4 — Authentication
- admin login;
- cookie session/token strategy;
- guards;
- logout;
- rate limiting.

### Phase 5 — Products API
- CRUD;
- aliases;
- validation.

### Phase 6 — News API
- CRUD;
- aliases;
- HTML sanitization.

### Phase 7 — Socials API
- CRUD;
- settings retrieval.

### Phase 8 — Orders API
- create order;
- transactional items;
- server-side pricing;
- statuses;
- admin CRUD.

### Phase 9 — Email
- EmailService;
- order email;
- provider configuration.

### Phase 10 — Public Design System
- typography;
- spacing;
- CSS variables;
- buttons;
- inputs;
- cards;
- layout primitives.

### Phase 11 — Public Layout
- header;
- mini-cart;
- footer;
- responsive layout.

### Phase 12 — Products UI
- product listing;
- product detail;
- gallery;
- quantity controls.

### Phase 13 — Cart
- CartProvider;
- localStorage persistence;
- cart page.

### Phase 14 — Checkout
- form;
- consent;
- API integration;
- success/error states.

### Phase 15 — News UI
- news list;
- news detail;
- sanitized content rendering.

### Phase 16 — Contacts + Contact Requests
- contacts page;
- social links;
- `ContactRequest` model + migration;
- public `POST /api/contact-requests` (validation, throttling, status always `NEW`);
- public contact request form on `/contacts`;
- **Admin Contact Requests UI/API is deferred** to Admin phases.

### Phase 17 — Admin UI Foundation
- same-origin `/api/*` via Next.js rewrite to Nest;
- HTTP-only cookie auth on the Next origin;
- middleware + layout protection for `/admin/*`;
- `/admin/login`, logout, admin shell (sidebar / topbar);
- dashboard landing page;
- responsive mobile drawer;
- **Admin CRUD modules deferred** to later phases.

### Phase 18 — Admin Products
- product CRUD UI.

### Phase 19 — Admin News
- news CRUD UI.

### Phase 20 — Admin Orders
- order list / detail / status.

### Phase 21 — Admin Contact Requests
- contact request list / detail / status / delete;
- list sort + shared admin table pagination / delete confirm modal.

### Phase 22 — Admin Settings
- socials / settings UI.

### Phase 23 — Cache Revalidation
- tags;
- mutation invalidation;
- stale-data checks.

### Phase 24 — SEO/Performance
- metadata;
- Open Graph;
- canonical;
- image optimization;
- performance review.

### Phase 25 — Security Review
- auth;
- validation;
- cookies;
- CORS;
- rate limiting;
- HTML;
- secrets;
- contact form abuse controls.

### Phase 26 — Testing
- unit tests;
- integration tests;
- API tests;
- critical E2E flows.

### Phase 27 — Production Readiness
- environment variables;
- migrations;
- seed strategy;
- build;
- deployment documentation;
- backups/operational notes.

---

## 20. Recommended Implementation Order

```text
1.  Repository/workspace
2.  Next.js + NestJS setup
3.  PostgreSQL + Prisma
4.  Database schema + migrations
5.  Seed admin
6.  Backend foundation
7.  Authentication
8.  Products API
9.  News API
10. Socials API
11. Orders API
12. Email service
13. Public CSS/design system
14. Public layout
15. Product UI
16. Cart
17. Checkout
18. News UI
19. Contacts + Contact Requests (public form + API)
20. Admin layout
21. Admin Products
22. Admin News
23. Admin Orders
24. Admin Contact Requests
25. Admin Settings
26. Statistics foundation
27. Cache revalidation
28. SEO
29. Security review
30. Tests
31. Production readiness
```

---

## 21. Quality Gates

After meaningful changes, run the relevant checks:

```text
typecheck
lint
unit/integration tests
build
```

Before MVP completion verify:

- clean install works;
- database migrations work;
- seed works;
- production build works;
- admin login works;
- product CRUD works;
- news CRUD works;
- order creation works;
- contact request creation works;
- email flow works;
- cart persists correctly;
- admin can manage contact requests;
- cache revalidation works;
- critical E2E scenarios pass.

---

## 22. Definition of Done

MVP is complete when:

- all required public pages exist;
- products can be browsed and added to cart;
- cart quantity/removal works;
- checkout creates orders;
- visitors can submit contact requests from `/contacts`;
- order totals are calculated on the backend;
- customer receives an order email;
- admin can log in securely;
- admin can manage products;
- admin can manage news;
- admin can manage orders;
- admin can manage contact requests and statuses;
- admin can manage socials/settings;
- cache invalidation prevents stale admin-managed content;
- basic SEO is implemented;
- security requirements are addressed;
- tests cover critical functionality;
- project can be built and configured for production.

