"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin-navigation";
import styles from "./AdminNavLinks.module.css";

type AdminNavLinksProps = {
  onNavigate?: () => void;
  className?: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks({ onNavigate, className }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={[styles.list, className].filter(Boolean).join(" ")}>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = !item.comingSoon && isActivePath(pathname, item.href);

        if (item.comingSoon) {
          return (
            <li key={item.href}>
              <span
                className={[styles.link, styles.soon].join(" ")}
                aria-disabled="true"
                title="Раздел будет доступен в следующих фазах"
              >
                <span>{item.label}</span>
                <span className={styles.badge}>скоро</span>
              </span>
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={[styles.link, active ? styles.active : undefined]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
