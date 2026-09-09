import Link from "next/link";
import { orderStatusLabel } from "@/constants/order-status";
import { formatPrice } from "@/lib/format-price";
import type { AdminOrderListItem } from "@/types/order";
import styles from "./OrdersTable.module.css";

type OrdersTableProps = {
  orders: AdminOrderListItem[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th} scope="col">
              ID
            </th>
            <th className={styles.th} scope="col">
              Дата
            </th>
            <th className={styles.th} scope="col">
              Клиент
            </th>
            <th className={styles.th} scope="col">
              Контакты
            </th>
            <th className={styles.th} scope="col">
              Статус
            </th>
            <th className={styles.th} scope="col">
              Сумма
            </th>
            <th className={styles.th} scope="col">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.id}>{order.id}</span>
              </td>
              <td className={styles.td}>{formatDate(order.createdAt)}</td>
              <td className={styles.td}>
                {order.firstName} {order.lastName}
              </td>
              <td className={styles.td}>
                <div>{order.userPhone}</div>
                <div className={styles.muted}>{order.userEmail}</div>
              </td>
              <td className={styles.td}>{orderStatusLabel(order.status)}</td>
              <td className={styles.td}>{formatPrice(order.totalPrice)}</td>
              <td className={styles.td}>
                <Link href={`/admin/orders/${order.id}`} className={styles.link}>
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
