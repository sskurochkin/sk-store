"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from "@/constants/order-status";
import { ApiError } from "@/services/api";
import { updateOrderStatus } from "@/services/admin-orders";
import type { OrderStatus } from "@/types/order";
import styles from "./OrderStatusForm.module.css";

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatusValue>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateOrderStatus(orderId, status);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Сессия истекла. Войдите снова.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Не удалось обновить статус.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="order-status">
          Статус
        </label>
        <select
          id="order-status"
          className={styles.select}
          value={status}
          disabled={isSaving}
          onChange={(event) =>
            setStatus(event.target.value as OrderStatusValue)
          }
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={isSaving || status === currentStatus}
      >
        {isSaving ? "Сохранение…" : "Сохранить статус"}
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
