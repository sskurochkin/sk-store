import type { Metadata } from "next";
import { ContactRequestsTable } from "@/components/admin/contact-requests/ContactRequestsTable";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listContactRequestsAdmin } from "@/services/admin-contact-requests";
import { getRequestCookieHeader } from "@/services/auth-server";
import type { AdminContactRequest } from "@/types/contact-request";
import styles from "./contact-requests-admin.module.css";

export const metadata: Metadata = {
  title: "Contact Requests",
  robots: { index: false, follow: false },
};

export default async function AdminContactRequestsPage() {
  let requests: AdminContactRequest[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    requests = await listContactRequestsAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Contact Requests</Heading>
          <Text muted>Просмотр заявок с формы контактов и смена статуса.</Text>
        </div>
      </header>

      {loadFailed ? (
        <ErrorState
          title="Не удалось загрузить заявки"
          description="Проверьте соединение и попробуйте обновить страницу."
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title="Пока нет заявок"
          description="Заявки появятся здесь после отправки формы на /contacts."
        />
      ) : (
        <ContactRequestsTable requests={requests} />
      )}
    </div>
  );
}
