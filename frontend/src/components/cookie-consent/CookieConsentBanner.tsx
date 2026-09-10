"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { COOKIE_CATEGORIES, COOKIE_CONSENT_OPEN_EVENT } from "@/constants/cookie-consent";
import {
  ACCEPT_ALL_CONSENT,
  REJECT_OPTIONAL_CONSENT,
  createConsentPreferences,
  loadCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent-storage";
import type { OptionalCookieCategory } from "@/types/cookie-consent";
import { Button } from "@/components/ui/Button/Button";
import styles from "./CookieConsent.module.css";

type ConsentUiMode = "hidden" | "initial" | "manage";

type DraftPreferences = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

function draftFromStored(): DraftPreferences {
  const stored = loadCookieConsent();
  if (stored) {
    return {
      functional: stored.functional,
      analytics: stored.analytics,
      marketing: stored.marketing,
    };
  }
  return {
    functional: false,
    analytics: false,
    marketing: false,
  };
}

export function CookieConsentBanner() {
  const settingsPanelId = useId();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ConsentUiMode>("hidden");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<DraftPreferences>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  const persist = useCallback((preferences: DraftPreferences) => {
    saveCookieConsent(createConsentPreferences(preferences));
    setMode("hidden");
    setSettingsOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = loadCookieConsent();
    if (!stored) {
      setMode("initial");
      setDraft(draftFromStored());
      return;
    }
    setMode("hidden");
  }, []);

  useEffect(() => {
    function openManageSettings() {
      setDraft(draftFromStored());
      setSettingsOpen(true);
      setMode("manage");
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openManageSettings);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openManageSettings);
    };
  }, []);

  useEffect(() => {
    if (mode === "hidden") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (settingsOpen) {
        event.preventDefault();
        if (mode === "initial") {
          setSettingsOpen(false);
          return;
        }
        setMode("hidden");
        setSettingsOpen(false);
        return;
      }

      if (mode === "manage") {
        event.preventDefault();
        setMode("hidden");
        setSettingsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mode, settingsOpen]);

  if (!mounted || mode === "hidden") {
    return null;
  }

  function toggleCategory(category: OptionalCookieCategory, checked: boolean) {
    setDraft((current) => ({ ...current, [category]: checked }));
  }

  const isInitial = mode === "initial";

  const showSettings = settingsOpen || !isInitial;

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div
        className={styles.banner}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className={styles.bannerRow}>
          <div className={styles.bannerText}>
            <h2 id="cookie-consent-title" className={styles.title}>
              {isInitial ? "Мы используем cookie" : "Настройки cookie"}
            </h2>
            <p id="cookie-consent-description" className={styles.lead}>
              {isInitial
                ? "Сайт использует необходимые технологии для работы и может сохранять ваши предпочтения. Вы можете принять все категории, отклонить необязательные или настроить выбор."
                : "Измените категории необязательных cookie. Необходимые технологии остаются включёнными."}{" "}
              <Link href="/cookie-policy" className={styles.leadLink}>
                Подробнее
              </Link>
            </p>
          </div>

          {isInitial && !settingsOpen ? (
            <div className={styles.actions}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  persist({
                    functional: ACCEPT_ALL_CONSENT.functional,
                    analytics: ACCEPT_ALL_CONSENT.analytics,
                    marketing: ACCEPT_ALL_CONSENT.marketing,
                  })
                }
              >
                Принять все
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  persist({
                    functional: REJECT_OPTIONAL_CONSENT.functional,
                    analytics: REJECT_OPTIONAL_CONSENT.analytics,
                    marketing: REJECT_OPTIONAL_CONSENT.marketing,
                  })
                }
              >
                Отклонить
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={settingsOpen}
                aria-controls={settingsPanelId}
                onClick={() => setSettingsOpen(true)}
              >
                Настроить
              </Button>
            </div>
          ) : null}
        </div>

        {showSettings ? (
          <div
            id={settingsPanelId}
            className={styles.settings}
            aria-labelledby="cookie-settings-heading"
          >
            <h3 id="cookie-settings-heading" className={styles.categoryTitle}>
              Категории
            </h3>
            <div className={styles.settingsScroll}>
              <ul className={styles.categoryList}>
                {COOKIE_CATEGORIES.map((category) => (
                  <li key={category.id} className={styles.category}>
                    <div className={styles.categoryHeader}>
                      <h4 className={styles.categoryTitle}>{category.title}</h4>
                      {category.required ? (
                        <span className={styles.requiredBadge}>Всегда включены</span>
                      ) : (
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            className={styles.toggleInput}
                            checked={draft[category.id]}
                            onChange={(event) => {
                              toggleCategory(category.id, event.target.checked);
                            }}
                          />
                          <span className={styles.toggleLabel}>
                            {draft[category.id] ? "Включено" : "Выключено"}
                          </span>
                        </label>
                      )}
                    </div>
                    <p className={styles.categoryDescription}>
                      {category.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.settingsActions}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => persist(draft)}
              >
                Сохранить настройки
              </Button>
              {!isInitial ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMode("hidden");
                    setSettingsOpen(false);
                  }}
                >
                  Закрыть
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(false)}
                >
                  Назад
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
