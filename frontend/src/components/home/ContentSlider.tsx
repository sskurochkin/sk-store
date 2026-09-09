"use client";

import Splide, { type Options } from "@splidejs/splide";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import "@splidejs/splide/css/core";
import styles from "./ContentSlider.module.css";

type ContentSliderProps = {
  children: ReactNode[];
  /** Accessible name for the carousel region. */
  label: string;
  /** Accessible labels for prev/next controls. */
  previousLabel?: string;
  nextLabel?: string;
};

export function ContentSlider({
  children,
  label,
  previousLabel = "Предыдущие",
  nextLabel = "Следующие",
}: ContentSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo<Options>(
    () => ({
      type: "slide",
      perPage: 1,
      perMove: 1,
      gap: "var(--space-5)",
      pagination: false,
      arrows: children.length > 1,
      drag: children.length > 1,
      omitEnd: true,
      mediaQuery: "min",
      breakpoints: {
        960: {
          perPage: 3,
        },
        540: {
          perPage: 2,
        },
      },
      i18n: {
        prev: previousLabel,
        next: nextLabel,
      },
      label,
    }),
    [children.length, label, nextLabel, previousLabel],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || children.length === 0) {
      return;
    }

    const splide = new Splide(root, options);
    splide.mount();

    return () => {
      splide.destroy();
    };
  }, [children.length, options]);

  if (children.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div
        ref={rootRef}
        className={`splide ${styles.splide}`}
        aria-label={label}
      >
        <div className="splide__track">
          <ul className="splide__list">
            {children.map((child, index) => (
              <li key={index} className={`splide__slide ${styles.slide}`}>
                {child}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
