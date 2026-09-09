import type { Metadata } from "next";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { EmptyState, ErrorState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listOrdersAdmin } from "@/services/admin-orders";
import { getRequestCookieHeader } from "@/services/auth-server";
import type { AdminOrderListItem } from "@/types/order";
import styles from "./orders-admin.module.css";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  let orders: AdminOrderListItem[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    orders = await listOrdersAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Orders</Heading>
          <Text muted>Просмотр заказов, смена статуса и удаление.</Text>
        </div>
      </header>

      {loadFailed ? (
        <ErrorState
          title="Не удалось загрузить заказы"
          description="Проверьте соединение и попробуйте обновить страницу."
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Пока нет заказов"
          description="Заказы появятся здесь после оформления на сайте."
        />
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
