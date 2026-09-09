"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./IconCatalog.module.css";

type IconCatalogProps = {
  names: string[];
};

export function IconCatalog({ names }: IconCatalogProps) {
  const { showToast } = useToast();

  async function copyName(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      showToast(`Скопировано: ${name}`);
    } catch {
      showToast("Не удалось скопировать имя");
    }
  }

  return (
    <ul className={styles.grid}>
      {names.map((name) => (
        <li key={name}>
          <button
            type="button"
            className={styles.item}
            onClick={() => {
              void copyName(name);
            }}
            title={`Скопировать «${name}»`}
          >
            <span className={styles.preview} aria-hidden="true">
              <Icon name={name} className={styles.icon} />
            </span>
            <span className={styles.name}>{name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
