"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { logout } from "@/services/auth";
import { ApiError } from "@/services/api";
import styles from "./AdminLogoutButton.module.css";
import { Icon } from "../ui/icon/Icon";

export function AdminLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onLogout() {
    setError(null);
    startTransition(async () => {
      try {
        await logout();
        router.replace("/admin/login");
        router.refresh();
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError("Не удалось выйти. Попробуйте ещё раз.");
          return;
        }
        setError("Не удалось выйти. Попробуйте ещё раз.");
      }
    });
  }

  return (
    <div className={styles.root}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
        onClick={onLogout}
      >
        <Icon name="i-logout" />
        {/* {pending ? "Выход…" : "Выйти"} */}
      </Button>
    </div>
  );
}
