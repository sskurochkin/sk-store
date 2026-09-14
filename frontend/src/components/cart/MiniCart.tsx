"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MiniCartPanel } from "@/components/cart/MiniCartPanel";
import { Icon } from "@/components/ui/icon/Icon";
import { useCart } from "@/hooks/useCart";
import styles from "./MiniCart.module.css";

const CLOSE_DELAY_MS = 175;
const DESKTOP_MEDIA_QUERY = "(min-width: 60rem)";

function formatKindsLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} вид товара`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} вида товаров`;
  }
  return `${count} видов товаров`;
}

export function MiniCart() {
  const pathname = usePathname();
  const { getItemCount, isHydrated } = useCart();
  const count = isHydrated ? getItemCount() : 0;
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const panelVisible = isDesktop && (hoverOpen || focusWithin);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncDesktop = () => setIsDesktop(mediaQuery.matches);
    syncDesktop();
    mediaQuery.addEventListener("change", syncDesktop);
    return () => mediaQuery.removeEventListener("change", syncDesktop);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function closePanel() {
    clearCloseTimer();
    setHoverOpen(false);
    setFocusWithin(false);
    if (
      document.activeElement instanceof HTMLElement &&
      wrapperRef.current?.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }
  }

  useEffect(() => {
    if (!panelVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (wrapperRef.current?.contains(target)) {
        return;
      }
      closePanel();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [panelVisible]);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handleMouseEnter() {
    if (!isDesktop) {
      return;
    }
    clearCloseTimer();
    setHoverOpen(true);
  }

  function handleMouseLeave() {
    if (!isDesktop) {
      return;
    }
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closePanel();
    }, CLOSE_DELAY_MS);
  }

  function handleFocusCapture() {
    if (!isDesktop) {
      return;
    }
    clearCloseTimer();
    setFocusWithin(true);
  }

  function handleBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
    if (!isDesktop) {
      return;
    }
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      wrapperRef.current?.contains(nextTarget)
    ) {
      return;
    }
    setFocusWithin(false);
  }

  const ariaLabel =
    count > 0 ? `Корзина, ${formatKindsLabel(count)}` : "Корзина";

  if (pathname === "/cart") {
    return (
      <span className={styles.wrapper}>
        <span
          className={clsx(styles.link, styles.linkStatic)}
          aria-label={ariaLabel}
          aria-current="page"
        >
          <Icon name="i-cart" className={styles.icon} />
          {count > 0 ? <span className={styles.badge}>{count}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.wrapper, panelVisible && styles.wrapperOpen)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <Link
        href="/cart"
        className={styles.link}
        aria-expanded={panelVisible}
        aria-haspopup={isDesktop ? "true" : undefined}
        aria-controls={isDesktop ? panelId : undefined}
        aria-label={ariaLabel}
      >
        <Icon name="i-cart" className={styles.icon} />
        {count > 0 ? <span className={styles.badge}>{count}</span> : null}
      </Link>

      {isDesktop ? (
        <div className={styles.panel}>
          <MiniCartPanel id={panelId} />
        </div>
      ) : null}
    </div>
  );
}
