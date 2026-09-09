"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import {
  CONTACT_REQUEST_STATUSES,
  CONTACT_REQUEST_STATUS_LABELS,
  type ContactRequestStatusValue,
} from "@/constants/contact-request-status";
import { ApiError } from "@/services/api";
import { updateContactRequestStatus } from "@/services/admin-contact-requests";
import type { ContactRequestStatus } from "@/types/contact-request";
import styles from "./ContactRequestStatusForm.module.css";

type ContactRequestStatusFormProps = {
  requestId: string;
  currentStatus: ContactRequestStatus;
};

export function ContactRequestStatusForm({
  requestId,
  currentStatus,
}: ContactRequestStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] =
    useState<ContactRequestStatusValue>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateContactRequestStatus(requestId, status);
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
        <label className={styles.label} htmlFor="contact-request-status">
          Статус
        </label>
        <select
          id="contact-request-status"
          className={styles.select}
          value={status}
          disabled={isSaving}
          onChange={(event) =>
            setStatus(event.target.value as ContactRequestStatusValue)
          }
        >
          {CONTACT_REQUEST_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CONTACT_REQUEST_STATUS_LABELS[value]}
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
