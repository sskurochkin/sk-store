"use client";

import { COOKIE_CONSENT_OPEN_EVENT } from "@/constants/cookie-consent";
import styles from "./Footer.module.css";

export function FooterCookieSettingsLink() {
  return (
    <button
      type="button"
      className={styles.navButton}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
      }}
    >
      Настройки cookie
    </button>
  );
}
