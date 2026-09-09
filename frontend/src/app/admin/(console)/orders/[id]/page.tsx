import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDeleteButton } from "@/components/admin/orders/OrderDeleteButton";
import { OrderStatusForm } from "@/components/admin/orders/OrderStatusForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { orderStatusLabel } from "@/constants/order-status";
import { formatPrice } from "@/lib/format-price";
import { getOrderAdmin } from "@/services/admin-orders";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../orders-admin.module.css";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order · ${id}`,
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

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  let order;

  try {
    order = await getOrderAdmin(id, cookie);
  } catch {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/orders" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Заказ {order.id}</Heading>
        <Text muted>
          {orderStatusLabel(order.status)} · {formatDate(order.createdAt)}
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
              {order.firstName} {order.lastName}
            </dd>
            <dt className={styles.dt}>Email</dt>
            <dd className={styles.dd}>{order.userEmail}</dd>
            <dt className={styles.dt}>Телефон</dt>
            <dd className={styles.dd}>{order.userPhone}</dd>
            <dt className={styles.dt}>Комментарий</dt>
            <dd className={styles.dd}>{order.comment ?? "—"}</dd>
          </dl>
        </section>

        <section className={styles.card} aria-labelledby="status-heading">
          <h2 id="status-heading" className={styles.cardTitle}>
            Статус
          </h2>
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </section>
      </div>

      <section className={styles.card} aria-labelledby="items-heading">
        <h2 id="items-heading" className={styles.cardTitle}>
          Состав заказа
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} scope="col">
                  Товар
                </th>
                <th className={styles.th} scope="col">
                  Цена
                </th>
                <th className={styles.th} scope="col">
                  Кол-во
                </th>
                <th className={styles.th} scope="col">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={`${item.productId ?? "gone"}-${index}`}>
                  <td className={styles.td}>{item.productName}</td>
                  <td className={styles.td}>{formatPrice(item.price)}</td>
                  <td className={styles.td}>{item.quantity}</td>
                  <td className={styles.td}>{formatPrice(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.total}>
          Итого: {formatPrice(order.totalPrice)}
        </p>
      </section>

      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.dangerTitle}>
          Удаление
        </h2>
        <Text muted size="sm">
          Удаление необратимо. Позиции заказа удалятся вместе с заказом.
        </Text>
        <OrderDeleteButton orderId={order.id} />
      </section>
    </div>
  );
}
