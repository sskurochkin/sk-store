"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import styles from "./MiniCart.module.css";

function CartIcon() {
  return (
    <svg
      className={styles.icon}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 4h1.6l1.2 11.2a1.5 1.5 0 0 0 1.5 1.3h9.4a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19.5" r="1.25" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function formatKindsLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} вид товара`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} вида товаров`;
  }
  return `${count} видов товаров`;
}

export function MiniCart() {
  const { getItemCount, isHydrated } = useCart();
  const count = isHydrated ? getItemCount() : 0;

  return (
    <Link
      href="/cart"
      className={styles.link}
      aria-label={
        count > 0 ? `Корзина, ${formatKindsLabel(count)}` : "Корзина"
      }
    >
      <CartIcon />
      {count > 0 ? <span className={styles.badge}>{count}</span> : null}
    </Link>
  );
}
