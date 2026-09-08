"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/constants/cart";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import styles from "./QuantityControls.module.css";

type QuantityControlsProps = {
  initialQuantity?: number;
  value?: number;
  onChange?: (quantity: number) => void;
  id?: string;
  /**
   * When true, pressing − at minimum quantity calls onChange(0)
   * so the parent can remove the line from the cart.
   */
  allowRemove?: boolean;
  /** Show a numeric input instead of a static value. */
  editable?: boolean;
  /**
   * Delay before keyboard input commits to onChange.
   * +/- and blur still commit immediately.
   */
  commitDelayMs?: number;
};

export function QuantityControls({
  initialQuantity = MIN_QUANTITY,
  value,
  onChange,
  id,
  allowRemove = false,
  editable = false,
  commitDelayMs = 0,
}: QuantityControlsProps) {
  const generatedId = useId();
  const labelId = id ?? `quantity-label-${generatedId}`;
  const inputId = `${labelId}-input`;
  const isControlled = value !== undefined;
  const [internalQuantity, setInternalQuantity] = useState(() =>
    Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, initialQuantity)),
  );
  const quantity = isControlled ? value : internalQuantity;
  const [draft, setDraft] = useState(String(quantity));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quantityRef = useRef(quantity);
  const onChangeRef = useRef(onChange);
  const allowRemoveRef = useRef(allowRemove);
  const isControlledRef = useRef(isControlled);

  quantityRef.current = quantity;
  onChangeRef.current = onChange;
  allowRemoveRef.current = allowRemove;
  isControlledRef.current = isControlled;

  const canDecrement = allowRemove
    ? quantity >= MIN_QUANTITY
    : quantity > MIN_QUANTITY;

  function clearDebounce() {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }

  function applyQuantity(next: number) {
    if (allowRemoveRef.current && next < MIN_QUANTITY) {
      onChangeRef.current?.(0);
      return;
    }

    const clamped = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, next));
    if (!isControlledRef.current) {
      setInternalQuantity(clamped);
    }
    setDraft(String(clamped));
    onChangeRef.current?.(clamped);
  }

  function commitDraft(raw: string) {
    const trimmed = raw.trim();

    if (trimmed === "") {
      if (allowRemoveRef.current) {
        onChangeRef.current?.(0);
        return;
      }
      setDraft(String(quantityRef.current));
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(quantityRef.current));
      return;
    }

    applyQuantity(parsed);
  }

  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  useEffect(() => {
    return () => {
      clearDebounce();
    };
  }, []);

  function setQuantityImmediate(next: number) {
    clearDebounce();
    applyQuantity(next);
  }

  function handleInputChange(raw: string) {
    const digitsOnly = raw.replace(/\D/g, "");
    setDraft(digitsOnly);

    if (commitDelayMs <= 0) {
      commitDraft(digitsOnly);
      return;
    }

    clearDebounce();
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      commitDraft(digitsOnly);
    }, commitDelayMs);
  }

  function handleInputBlur() {
    clearDebounce();
    commitDraft(draft);
  }

  return (
    <div className={styles.wrapper}>
      {editable ? (
        <label className={styles.label} htmlFor={inputId}>
          Количество
        </label>
      ) : (
        <p className={styles.label} id={labelId}>
          Количество
        </p>
      )}
      <div
        className={styles.controls}
        role="group"
        aria-labelledby={editable ? undefined : labelId}
      >
        <IconButton
          aria-label="Уменьшить количество"
          onClick={() => setQuantityImmediate(quantity - 1)}
          disabled={!canDecrement}
        >
          −
        </IconButton>
        {editable ? (
          <input
            id={inputId}
            className={styles.input}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={draft}
            onChange={(event) => handleInputChange(event.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
        ) : (
          <span className={styles.value} aria-live="polite">
            {quantity}
          </span>
        )}
        <IconButton
          aria-label="Увеличить количество"
          onClick={() => setQuantityImmediate(quantity + 1)}
          disabled={quantity >= MAX_QUANTITY}
        >
          +
        </IconButton>
      </div>
    </div>
  );
}
