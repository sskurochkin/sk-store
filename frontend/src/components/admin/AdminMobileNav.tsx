"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { AdminNavLinks } from "./AdminNavLinks";
import styles from "./AdminMobileNav.module.css";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className={styles.root}>
      <IconButton
        className={styles.toggle}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? "i-close" : "i-burger"} className={styles.icon} />
      </IconButton>

      <div
        id={panelId}
        className={[styles.panel, open ? styles.panelOpen : undefined]
          .filter(Boolean)
          .join(" ")}
        hidden={!open}
      >
        <nav aria-label="Админ-меню">
          <AdminNavLinks onNavigate={() => setOpen(false)} />
          <Link
            href="/"
            className={styles.siteLink}
            onClick={() => setOpen(false)}
          >
            ← На сайт
          </Link>
        </nav>
      </div>
    </div>
  );
}
