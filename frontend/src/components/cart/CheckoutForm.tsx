"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Input } from "@/components/ui/Input/Input";
import { useCart } from "@/hooks/useCart";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";
import { ApiError } from "@/services/api";
import { createOrder } from "@/services/orders";
import type { OrderResponse } from "@/types/order";
import styles from "./CheckoutForm.module.css";

type CheckoutFormProps = {
  onSuccess: (order: OrderResponse) => void;
};

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { items, clearCart } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userEmail: "",
      userPhone: "",
      consent: false,
    },
  });

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Корзина пуста");
      return;
    }

    try {
      const order = await createOrder({
        firstName: values.firstName,
        lastName: values.lastName,
        userEmail: values.userEmail,
        userPhone: values.userPhone,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      onSuccess(order);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setSubmitError("Слишком много запросов. Попробуйте чуть позже.");
          return;
        }
        if (error.status === 404) {
          setSubmitError(
            "Один из товаров больше недоступен. Обновите корзину и попробуйте снова.",
          );
          return;
        }
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Не удалось оформить заказ. Проверьте соединение.");
    }
  }

  const disabled = isSubmitting || items.length === 0;

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="checkout-heading"
    >
      <h2 id="checkout-heading" className={styles.title}>
        Оформление заказа
      </h2>

      <div className={styles.grid}>
        <Input
          id="checkout-first-name"
          label="Имя"
          autoComplete="given-name"
          required
          disabled={disabled}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          id="checkout-last-name"
          label="Фамилия"
          autoComplete="family-name"
          required
          disabled={disabled}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        <div className={styles.gridFull}>
          <Input
            id="checkout-email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            disabled={disabled}
            error={errors.userEmail?.message}
            {...register("userEmail")}
          />
        </div>
        <div className={styles.gridFull}>
          <Input
            id="checkout-phone"
            label="Телефон"
            type="tel"
            autoComplete="tel"
            required
            disabled={disabled}
            error={errors.userPhone?.message}
            {...register("userPhone")}
          />
        </div>
        <div className={styles.gridFull}>
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="checkout-consent"
                label="Согласие на обработку персональных данных"
                required
                disabled={disabled}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                error={errors.consent?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.submitRow}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={disabled}>
          {isSubmitting ? "Отправка…" : "Оформить заказ"}
        </Button>
      </div>
    </form>
  );
}
