"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/constants/cart";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { lineSubtotal } from "@/lib/cart-money";
import { clampQuantity, loadCartItems, saveCartItems } from "@/lib/cart-storage";
import type { AddCartItemInput, CartItem } from "@/types/cart";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (input: AddCartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Number of distinct product lines (kinds), not total units. */
  getItemCount: () => number;
  getTotal: () => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCartItems());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveCartItems(items);
  }, [items, isHydrated]);

  const addItem = useCallback(
    (input: AddCartItemInput) => {
      const quantityToAdd = clampQuantity(input.quantity);

      setItems((current) => {
        const existing = current.find(
          (item) => item.productId === input.productId,
        );

        if (existing) {
          return current.map((item) =>
            item.productId === input.productId
              ? {
                  ...item,
                  quantity: Math.min(
                    MAX_QUANTITY,
                    item.quantity + quantityToAdd,
                  ),
                  name: input.name,
                  price: input.price,
                  mainPhoto: input.mainPhoto,
                  alias: input.alias,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            productId: input.productId,
            quantity: quantityToAdd,
            name: input.name,
            price: input.price,
            mainPhoto: input.mainPhoto,
            alias: input.alias,
          },
        ];
      });

      showToast("Товар добавлен в корзину");
    },
    [showToast],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((current) =>
        current.filter((item) => item.productId !== productId),
      );
      showToast("Товар удалён из корзины");
    },
    [showToast],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!Number.isFinite(quantity) || quantity < MIN_QUANTITY) {
        setItems((current) =>
          current.filter((item) => item.productId !== productId),
        );
        showToast("Товар удалён из корзины");
        return;
      }

      const nextQuantity = clampQuantity(quantity);
      setItems((current) =>
        current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      );
      showToast("Количество обновлено");
    },
    [showToast],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    showToast("Корзина очищена");
  }, [showToast]);

  const getItemCount = useCallback(() => items.length, [items]);

  const getTotal = useCallback(() => {
    return items.reduce(
      (sum, item) => sum + lineSubtotal(item.price, item.quantity),
      0,
    );
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotal,
    }),
    [
      items,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotal,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
