"use client";

import Link from "next/link";
import { QuantityControls } from "@/components/product/QuantityControls";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Text } from "@/components/ui/Text/Text";
import { useCart } from "@/hooks/useCart";
import { formatCartMoney, lineSubtotal } from "@/lib/cart-money";
import { formatPrice } from "@/lib/format-price";
import styles from "./CartPageContent.module.css";

export function CartPageContent() {
  const {
    items,
    isHydrated,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
  } = useCart();

  if (!isHydrated) {
    return (
      <Text muted role="status">
        Загрузка корзины…
      </Text>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <header className={styles.headerRow}>
          <Heading id="cart-heading" level={1}>
            Корзина
          </Heading>
        </header>
        <EmptyState
          title="Корзина пуста"
          description="Добавьте выпечку из каталога."
          action={
            <Link href="/products" className={styles.catalogLink}>
              В каталог
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <header className={styles.headerRow}>
        <Heading id="cart-heading" level={1}>
          Корзина
        </Heading>
        <Button type="button" variant="ghost" onClick={clearCart}>
          Очистить
        </Button>
      </header>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.productId} className={styles.item}>
            <div className={styles.media}>
              <MediaImage
                src={item.mainPhoto}
                alt={item.name}
                aspectRatio="1/1"
                sizes="112px"
              />
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <div>
                  <Link
                    href={`/products/${item.alias}`}
                    className={styles.name}
                  >
                    {item.name}
                  </Link>
                  <p className={styles.unitPrice}>
                    {formatPrice(item.price)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  Удалить
                </Button>
              </div>
              <div className={styles.controlsRow}>
                <QuantityControls
                  value={item.quantity}
                  onChange={(quantity) =>
                    updateQuantity(item.productId, quantity)
                  }
                  id={`cart-qty-${item.productId}`}
                  allowRemove
                />
                <p className={styles.lineTotal}>
                  {formatCartMoney(lineSubtotal(item.price, item.quantity))}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <div>
          <p className={styles.totalLabel}>Итого</p>
          <p className={styles.totalValue}>{formatCartMoney(getTotal())}</p>
        </div>
      </div>
    </>
  );
}
