import type { CookieCategoryDefinition } from "@/types/cookie-consent";

/** localStorage key — distinct from auth HTTP cookies and cart storage. */
export const COOKIE_CONSENT_STORAGE_KEY = "sk-store:cookie-consent";

/** Bump when categories or semantics change to prompt re-consent. */
export const COOKIE_CONSENT_VERSION = "1";

/** Custom event for reopening settings from Footer / cookie policy page. */
export const COOKIE_CONSENT_OPEN_EVENT = "sk-store:open-cookie-settings";

/** Dispatched in the browser after consent is saved or updated. */
export const COOKIE_CONSENT_CHANGED_EVENT = "sk-store:cookie-consent-changed";

export const COOKIE_CATEGORIES: CookieCategoryDefinition[] = [
  {
    id: "necessary",
    title: "Необходимые",
    description:
      "Используются для корректной работы сайта, навигации, безопасности и других обязательных функций. Эту категорию нельзя отключить.",
    required: true,
  },
  {
    id: "functional",
    title: "Функциональные",
    description:
      "Используются для сохранения пользовательских предпочтений и дополнительных функций сайта (например, содержимое корзины в браузере).",
    required: false,
  },
  {
    id: "analytics",
    title: "Аналитические",
    description:
      "Используются для анализа использования сайта и улучшения его работы. На данный момент сторонние аналитические сервисы не подключены.",
    required: false,
  },
  {
    id: "marketing",
    title: "Маркетинговые",
    description:
      "Используются для маркетинговых и рекламных целей. На данный момент рекламные интеграции не подключены.",
    required: false,
  },
];
