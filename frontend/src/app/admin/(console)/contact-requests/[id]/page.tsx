import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactRequestDeleteButton } from "@/components/admin/contact-requests/ContactRequestDeleteButton";
import { ContactRequestStatusForm } from "@/components/admin/contact-requests/ContactRequestStatusForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { contactRequestStatusLabel } from "@/constants/contact-request-status";
import { getContactRequestAdmin } from "@/services/admin-contact-requests";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../contact-requests-admin.module.css";

type ContactRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ContactRequestDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Contact request · ${id}`,
    robots: { index: false, follow: false },
  };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ru-RU");
}

export default async function AdminContactRequestDetailPage({
  params,
}: ContactRequestDetailPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  let request;

  try {
    request = await getContactRequestAdmin(id, cookie);
  } catch {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/contact-requests" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Заявка</Heading>
        <Text muted>
          {contactRequestStatusLabel(request.status)} ·{" "}
          {formatDate(request.createdAt)}
        </Text>
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="customer-heading">
          <h2 id="customer-heading" className={styles.cardTitle}>
            Клиент
          </h2>
          <dl className={styles.dl}>
            <dt className={styles.dt}>Имя</dt>
            <dd className={styles.dd}>
              {request.firstName} {request.lastName}
            </dd>
            <dt className={styles.dt}>Email</dt>
            <dd className={styles.dd}>{request.email}</dd>
            <dt className={styles.dt}>Телефон</dt>
            <dd className={styles.dd}>{request.phone}</dd>
            <dt className={styles.dt}>Согласие</dt>
            <dd className={styles.dd}>{request.consent ? "Да" : "Нет"}</dd>
          </dl>
        </section>

        <section className={styles.card} aria-labelledby="status-heading">
          <h2 id="status-heading" className={styles.cardTitle}>
            Статус
          </h2>
          <ContactRequestStatusForm
            requestId={request.id}
            currentStatus={request.status}
          />
        </section>
      </div>

      <section className={styles.card} aria-labelledby="message-heading">
        <h2 id="message-heading" className={styles.cardTitle}>
          Сообщение
        </h2>
        <p className={styles.message}>{request.message}</p>
      </section>

      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.dangerTitle}>
          Удаление
        </h2>
        <Text muted>
          Удаление необратимо. Заявка исчезнет из списка администратора.
        </Text>
        <ContactRequestDeleteButton
          requestId={request.id}
          clientName={`${request.firstName} ${request.lastName}`.trim()}
        />
      </section>
    </div>
  );
}
