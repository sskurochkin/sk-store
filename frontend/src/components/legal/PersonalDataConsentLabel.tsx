"use client";

import Link from "next/link";
import { PRIVACY_POLICY_PATH } from "@/constants/legal-links";
import styles from "./PersonalDataConsentLabel.module.css";

/** Checkbox label with link to the privacy policy (forms: cart, contacts, home). */
export function PersonalDataConsentLabel() {
  return (
    <>
      Согласие на{" "}
      <Link
        href={PRIVACY_POLICY_PATH}
        className={styles.link}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.preventDefault()}
      >
        обработку персональных данных
      </Link>
    </>
  );
}
