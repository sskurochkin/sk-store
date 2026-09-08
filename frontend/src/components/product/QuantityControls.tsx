"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import styles from "./QuantityControls.module.css";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

type QuantityControlsProps = {
  initialQuantity?: number;
};

export function QuantityControls({
  initialQuantity = MIN_QUANTITY,
}: QuantityControlsProps) {
  const clampedInitial = Math.min(
    MAX_QUANTITY,
    Math.max(MIN_QUANTITY, initialQuantity),
  );
  const [quantity, setQuantity] = useState(clampedInitial);

  function decrease() {
    setQuantity((current) => Math.max(MIN_QUANTITY, current - 1));
  }

  function increase() {
    setQuantity((current) => Math.min(MAX_QUANTITY, current + 1));
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label} id="quantity-label">
        Количество
      </p>
      <div
        className={styles.controls}
        role="group"
        aria-labelledby="quantity-label"
      >
        <IconButton
          aria-label="Уменьшить количество"
          onClick={decrease}
          disabled={quantity <= MIN_QUANTITY}
        >
          −
        </IconButton>
        <span className={styles.value} aria-live="polite">
          {quantity}
        </span>
        <IconButton
          aria-label="Увеличить количество"
          onClick={increase}
          disabled={quantity >= MAX_QUANTITY}
        >
          +
        </IconButton>
      </div>
    </div>
  );
}
