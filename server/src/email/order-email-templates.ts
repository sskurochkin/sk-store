import type { OrderEmailPayload } from './types/order-email.type';
import { escapeHtml } from './escape-html';

function formatCustomerName(payload: OrderEmailPayload): string {
  return `${payload.firstName} ${payload.lastName}`.trim();
}

function formatItemsPlain(payload: OrderEmailPayload): string {
  return payload.items
    .map(
      (item) =>
        `${item.productName} — ${item.quantity} × €${item.unitPrice} = €${item.lineTotal}`,
    )
    .join('\n');
}

function formatItemsHtml(payload: OrderEmailPayload): string {
  const rows = payload.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.productName)} — ${item.quantity} × €${escapeHtml(item.unitPrice)} = €${escapeHtml(item.lineTotal)}</li>`,
    )
    .join('');
  return `<ul>${rows}</ul>`;
}

export function buildCustomerOrderEmail(payload: OrderEmailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const name = formatCustomerName(payload);
  const subject = `Order confirmation #${payload.orderId}`;
  const text = [
    `Hello ${name},`,
    '',
    'Thank you for your order.',
    '',
    `Order: ${payload.orderId}`,
    '',
    'Items:',
    formatItemsPlain(payload),
    '',
    `Total: €${payload.totalPrice}`,
    '',
    `Status: ${payload.status}`,
    ...(payload.comment ? ['', `Comment: ${payload.comment}`] : []),
  ].join('\n');

  const html = [
    `<p>Hello ${escapeHtml(name)},</p>`,
    `<p>Thank you for your order.</p>`,
    `<p><strong>Order:</strong> ${escapeHtml(payload.orderId)}</p>`,
    `<p><strong>Items:</strong></p>`,
    formatItemsHtml(payload),
    `<p><strong>Total:</strong> €${escapeHtml(payload.totalPrice)}</p>`,
    `<p><strong>Status:</strong> ${escapeHtml(payload.status)}</p>`,
    payload.comment
      ? `<p><strong>Comment:</strong> ${escapeHtml(payload.comment)}</p>`
      : '',
  ].join('');

  return { subject, text, html };
}

export function buildBusinessOrderEmail(payload: OrderEmailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const name = formatCustomerName(payload);
  const subject = `New order #${payload.orderId}`;
  const text = [
    `New order received.`,
    '',
    `Order: ${payload.orderId}`,
    `Customer: ${name}`,
    `Email: ${payload.userEmail}`,
    `Phone: ${payload.userPhone}`,
    ...(payload.comment ? [`Comment: ${payload.comment}`] : []),
    '',
    'Items:',
    formatItemsPlain(payload),
    '',
    `Total: €${payload.totalPrice}`,
    '',
    `Status: ${payload.status}`,
  ].join('\n');

  const html = [
    `<p>New order received.</p>`,
    `<p><strong>Order:</strong> ${escapeHtml(payload.orderId)}</p>`,
    `<p><strong>Customer:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.userEmail)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(payload.userPhone)}</p>`,
    payload.comment
      ? `<p><strong>Comment:</strong> ${escapeHtml(payload.comment)}</p>`
      : '',
    `<p><strong>Items:</strong></p>`,
    formatItemsHtml(payload),
    `<p><strong>Total:</strong> €${escapeHtml(payload.totalPrice)}</p>`,
    `<p><strong>Status:</strong> ${escapeHtml(payload.status)}</p>`,
  ].join('');

  return { subject, text, html };
}
