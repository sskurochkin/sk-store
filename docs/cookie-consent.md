# Cookie consent and legal pages

Public legal information and browser-side cookie consent for SK Store.

## Routes

| Route | Title |
| --- | --- |
| `/privacy-policy` | Политика обработки персональных данных |
| `/cookie-policy` | Обработка файлов cookie |

Both pages are Server Components with SEO metadata via `buildPageMetadata` (`frontend/src/lib/seo.ts`).

Content sections live in:

- `frontend/src/constants/legal/privacy-policy-sections.ts`
- `frontend/src/constants/legal/cookie-policy-sections.ts`

Text is a neutral template and must be reviewed by the site operator’s legal counsel before production use.

## Cookie consent UI

- Component: `frontend/src/components/cookie-consent/CookieConsentBanner.tsx` (Client Component)
- Mounted in `frontend/src/app/(shop)/layout.tsx` only — **not** on `/admin/*`
- Re-open settings: Footer link «Настройки cookie», button on `/cookie-policy`, or `CookieSettingsButton`

### User flow

1. First visit (no stored consent) → banner at bottom of viewport
2. **Принять все** → all optional categories enabled, banner hidden
3. **Отклонить** → all optional categories disabled, banner hidden
4. **Настроить** → category toggles; **Сохранить настройки** persists choice

Necessary technologies are always on and cannot be disabled.

### Changing choice later

- Footer → «Настройки cookie» (under «Документы»)
- `/cookie-policy` → «Настройки cookie» button

These dispatch a custom event (`COOKIE_CONSENT_OPEN_EVENT`) that reopens the banner in manage mode.

## Storage

| Key | Location |
| --- | --- |
| `sk-store:cookie-consent` | `localStorage` (browser only) |

Types: `frontend/src/types/cookie-consent.ts`  
Read/write: `frontend/src/lib/cookie-consent-storage.ts`

```ts
type CookieConsentPreferences = {
  version: string;       // e.g. "1" — bump to invalidate old choices
  necessary: true;       // always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;     // ISO timestamp
};
```

- No backend persistence
- No PII in consent payload
- Invalid or outdated `version` → treated as no consent (banner shown again)
- SSR-safe: storage is read only after client mount

## Categories

| Category | Default | Notes |
| --- | --- | --- |
| Necessary | always on | Site operation, security, navigation |
| Functional | off | User preferences (e.g. cart uses separate `sk-store:cart` key today) |
| Analytics | off | Category exists for future use; **no analytics scripts are loaded by consent alone** |
| Marketing | off | Category exists for future use; **no marketing scripts are loaded by consent alone** |

## Future integrations

Before loading any optional third-party script (analytics, ads, etc.):

1. Read consent with `loadCookieConsent()` (client only)
2. Check the relevant helper, e.g. `hasAnalyticsConsent()` / `hasMarketingConsent()`
3. Load the integration only if consent is granted

Consent storage is a **permission flag only** — it must not create third-party cookies by itself.

## Auth separation

Admin authentication uses an HTTP-only JWT cookie (`access_token`). Cookie consent:

- does not read, write, or delete auth cookies
- does not interact with Next.js middleware or NestJS auth
- uses a distinct storage key (`sk-store:cookie-consent`) to avoid confusion with cart (`sk-store:cart`)

## Footer

`Footer` includes a «Документы» block with links to both legal pages plus «Настройки cookie».
