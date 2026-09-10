# Site settings

Editable public site configuration stored in PostgreSQL and managed from `/admin/settings`.

## Data model

### SiteSettings (singleton, `id = "default"`)

| Field | Public | Admin form |
| --- | --- | --- |
| `siteName` | yes | General |
| `tagline` | yes | General |
| `description` | yes | General |
| `footerBlurb` | yes | General |
| `logoUrl` | yes | General |
| `seoMetaDescription` | yes | SEO |
| `seoKeywords` | yes | SEO |
| `seoRobotsIndex` | yes | SEO |
| `seoRobotsFollow` | yes | SEO |
| `seoOgTitle` | yes | SEO |
| `seoOgDescription` | yes | SEO |
| `seoOgImageUrl` | yes | SEO |
| `googleAnalyticsId` | yes (public, loaded with consent) | SEO |
| `yandexMetrikaId` | yes (public, loaded with consent) | SEO |
| `phone` | yes | Contacts |
| `email` | yes | Contacts |
| `address` | yes | Contacts |
| `workingHours` | yes | Contacts |
| `mapEnabled` | yes | Map |
| `mapEmbedUrl` | yes | Map |
| `mapLinkUrl` | yes | Map |
| `legalOperatorName` | yes (privacy placeholders) | Contacts |
| `legalContactEmail` | yes (privacy placeholders) | Contacts |

### HomeBenefit (collection)

Used on home page block «Почему выбирают нас». Fields: `title`, `description`, `icon`, `sortOrder`.

### LegalPage (fixed slugs)

- `privacy-policy`
- `cookie-policy`

`sections` is a JSON array: `{ id, title, paragraphs[] }`.

## API

| Method | Route | Auth |
| --- | --- | --- |
| GET | `/api/settings` | public |
| PATCH | `/api/settings` | JWT |
| GET | `/api/home-benefits` | public |
| POST/PATCH/DELETE | `/api/home-benefits` | JWT |
| GET | `/api/legal-pages/:slug` | public |
| PATCH | `/api/legal-pages/:slug` | JWT |

## Frontend

- Types: `frontend/src/types/site-settings.ts`
- Defaults: `frontend/src/constants/site-settings.defaults.ts`
- Merge: `frontend/src/lib/merge-site-settings.ts`
- Public fetch: `frontend/src/services/settings.ts` → never throws
- Admin: `frontend/src/services/admin-settings.ts`

If the API fails or returns invalid data, the UI uses defaults from constants (same pattern as socials empty fallback).

## Cache

| Mutation | Tags |
| --- | --- |
| Site settings PATCH | `settings` |
| Home benefit CUD | `home-benefits` |
| Legal page PATCH | `legal-page:{slug}` |
| Social CUD | `socials`, `settings` (unchanged) |

Server Actions: `revalidateSettingsCache`, `revalidateHomeBenefitsCache`, `revalidateLegalPagesCache` in `frontend/src/lib/revalidate-public-cache.ts`.

## What stays in code / env

- `MAIN_NAV_LINKS`, `FOOTER_LEGAL_LINKS`
- `NEXT_PUBLIC_SITE_URL` (canonical / metadataBase)
- Map provider API keys (future) — env only
- Cookie consent storage — browser localStorage
- `Social` — separate CRUD (not embedded in SiteSettings)

## Admin routes

```text
/admin/settings
├── /general
├── /seo
├── /contacts
├── /map
├── /benefits/new | /benefits/[id]/edit
├── /legal/privacy-policy | /legal/cookie-policy
└── /socials/... (existing)
```
