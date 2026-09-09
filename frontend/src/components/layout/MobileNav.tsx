"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/ui/icon/Icon";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import type { NavLink } from "@/constants/navigation";
import styles from "./MobileNav.module.css";

type MobileNavProps = {
  links: NavLink[];
};

export function MobileNav({ links }: MobileNavProps) {
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
        <nav aria-label="Mobile navigation">
          <ul className={styles.list}>
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
