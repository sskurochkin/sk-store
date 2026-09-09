"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { ApiError } from "@/services/api";
import { login } from "@/services/auth";
import styles from "./AdminLoginForm.module.css";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Укажите имя пользователя"),
  password: z.string().min(1, "Укажите пароль"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AdminLoginFormProps = {
  nextPath?: string;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      await login(values.username, values.password);
      const target =
        nextPath &&
        nextPath.startsWith("/admin") &&
        !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin";
      router.replace(target);
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setSubmitError("Неверное имя пользователя или пароль.");
          return;
        }
        if (error.status === 429) {
          setSubmitError("Слишком много попыток. Попробуйте позже.");
          return;
        }
      }
      setSubmitError("Не удалось войти. Попробуйте ещё раз.");
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="admin-login-heading"
    >
      <Input
        id="admin-username"
        label="Имя пользователя"
        autoComplete="username"
        required
        disabled={isSubmitting}
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        id="admin-password"
        label="Пароль"
        type="password"
        autoComplete="current-password"
        required
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />

      {submitError ? (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Вход…" : "Войти"}
      </Button>
    </form>
  );
}
