"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import { useCart } from "@/hooks/useCart";
import styles from "./MiniCart.module.css";

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
      <Icon name="i-cart" className={styles.icon} />
      {count > 0 ? <span className={styles.badge}>{count}</span> : null}
    </Link>
  );
}
