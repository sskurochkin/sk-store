import type { Metadata } from "next";
import Link from "next/link";
import { HomeBenefitsTable } from "@/components/admin/home-benefits/HomeBenefitsTable";
import { SocialsTable } from "@/components/admin/socials/SocialsTable";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listHomeBenefitsAdmin } from "@/services/admin-home-benefits";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listSocialsAdmin } from "@/services/admin-socials";
import type { HomeBenefit } from "@/types/home-benefit";
import type { Social } from "@/types/social";
import styles from "./settings-admin.module.css";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

const SETTINGS_LINKS = [
  {
    href: "/admin/settings/general",
    title: "Общие",
    description: "Название, логотип, описание, текст в подвале",
  },
  {
    href: "/admin/settings/seo",
    title: "SEO",
    description: "Meta, robots, Open Graph, GA и Яндекс.Метрика",
  },
  {
    href: "/admin/settings/contacts",
    title: "Контакты",
    description: "Телефон, email, адрес, часы работы, legal placeholders",
  },
  {
    href: "/admin/settings/map",
    title: "Карта",
    description: "Embed и ссылка на карты для страницы контактов",
  },
  {
    href: "/admin/settings/legal/privacy-policy",
    title: "Политика ПДн",
    description: "Текст страницы /privacy-policy",
  },
  {
    href: "/admin/settings/legal/cookie-policy",
    title: "Cookie policy",
    description: "Текст страницы /cookie-policy",
  },
] as const;

export default async function AdminSettingsPage() {
  let socials: Social[] = [];
  let benefits: HomeBenefit[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    [socials, benefits] = await Promise.all([
      listSocialsAdmin(cookie),
      listHomeBenefitsAdmin(cookie),
    ]);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Settings</Heading>
          <Text muted>
            Настройки магазина: общая информация, контакты, карта, главная и
            документы.
          </Text>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="settings-links-heading">
        <h2 id="settings-links-heading" className={styles.sectionTitle}>
          Разделы настроек
        </h2>
        <ul className={styles.linkGrid}>
          {SETTINGS_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.settingsCard}>
                <span className={styles.settingsCardTitle}>{item.title}</span>
                <span className={styles.settingsCardDescription}>
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="benefits-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.headerText}>
            <h2 id="benefits-heading" className={styles.sectionTitle}>
              Преимущества на главной
            </h2>
            <Text muted size="sm">
              Блок «Почему выбирают нас» на главной странице.
            </Text>
          </div>
          <Link href="/admin/settings/benefits/new" className={styles.createLink}>
            Добавить
          </Link>
        </div>

        {loadFailed ? (
          <ErrorState
            title="Не удалось загрузить данные"
            description="Проверьте соединение и попробуйте обновить страницу."
          />
        ) : benefits.length === 0 ? (
          <EmptyState
            title="Пока нет преимуществ"
            description="Добавьте первый пункт для блока на главной."
            action={
              <Link
                href="/admin/settings/benefits/new"
                className={styles.createLink}
              >
                Создать
              </Link>
            }
          />
        ) : (
          <HomeBenefitsTable benefits={benefits} />
        )}
      </section>

      <section className={styles.section} aria-labelledby="socials-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.headerText}>
            <h2 id="socials-heading" className={styles.sectionTitle}>
              Соцсети
            </h2>
            <Text muted size="sm">
              Ссылки отображаются в футере и на странице контактов.
            </Text>
          </div>
          <Link
            href="/admin/settings/socials/new"
            className={styles.createLink}
          >
            Добавить
          </Link>
        </div>

        {loadFailed ? (
          <ErrorState
            title="Не удалось загрузить соцсети"
            description="Проверьте соединение и попробуйте обновить страницу."
          />
        ) : socials.length === 0 ? (
          <EmptyState
            title="Пока нет соцсетей"
            description="Добавьте первую ссылку для футера и контактов."
            action={
              <Link
                href="/admin/settings/socials/new"
                className={styles.createLink}
              >
                Создать
              </Link>
            }
          />
        ) : (
          <SocialsTable socials={socials} />
        )}
      </section>
    </div>
  );
}
