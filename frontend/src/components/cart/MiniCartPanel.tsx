"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MiniCartLine } from "@/components/cart/MiniCartLine";
import { Text } from "@/components/ui/Text/Text";
import { useCart } from "@/hooks/useCart";
import { formatCartMoney } from "@/lib/cart-money";
import styles from "./MiniCartPanel.module.css";

const silent = { silent: true } as const;

type MiniCartPanelProps = {
  id: string;
};

export function MiniCartPanel({ id }: MiniCartPanelProps) {
  const pathname = usePathname();
  const { items, isHydrated, updateQuantity, removeItem, getTotal } = useCart();
  const showCatalogLink = pathname !== "/products";

  if (!isHydrated) {
    return (
      <div
        id={id}
        className={styles.panel}
        role="region"
        aria-label="Мини-корзина"
      >
        <Text muted className={styles.loading}>
          Загрузка…
        </Text>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        id={id}
        className={styles.panel}
        role="region"
        aria-label="Мини-корзина"
      >
        <div className={styles.empty}>
          <Text muted>Корзина пуста</Text>
          {showCatalogLink ? (
            <Link href="/products" className={styles.catalogLink}>
              В каталог
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={styles.panel}
      role="region"
      aria-label="Мини-корзина"
    >
      <ul className={styles.list}>
        {items.map((item) => (
          <MiniCartLine
            key={item.productId}
            item={item}
            onQuantityChange={(quantity) =>
              updateQuantity(item.productId, quantity, silent)
            }
            onRemove={() => removeItem(item.productId, silent)}
          />
        ))}
      </ul>
      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Итого</span>
          <span className={styles.totalValue}>{formatCartMoney(getTotal())}</span>
        </div>
        <Link href="/cart" className={styles.cta}>
          Перейти в корзину
        </Link>
      </div>
    </div>
  );
}
