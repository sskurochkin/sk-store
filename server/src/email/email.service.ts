import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import type { AppConfig } from '../config/configuration';
import { EMAIL_TRANSPORT } from './email.constants';
import {
  buildBusinessOrderEmail,
  buildCustomerOrderEmail,
} from './order-email-templates';
import type { OrderEmailPayload } from './types/order-email.type';

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    @Inject(EMAIL_TRANSPORT) private readonly transport: Transporter,
  ) {}

  /**
   * Sends customer confirmation and business notification for a persisted order.
   * Uses Order/OrderItem snapshot fields only.
   */
  async sendOrderConfirmation(payload: OrderEmailPayload): Promise<void> {
    this.assertRecipient(payload.userEmail, 'customer');

    const notificationEmail = this.configService.get(
      'email.orderNotificationEmail',
      { infer: true },
    );
    this.assertRecipient(notificationEmail, 'business');

    const from = this.configService.get('email.from', { infer: true });
    const customer = buildCustomerOrderEmail(payload);
    const business = buildBusinessOrderEmail(payload);

    await this.transport.sendMail({
      from,
      to: payload.userEmail,
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
    });

    await this.transport.sendMail({
      from,
      to: notificationEmail,
      subject: business.subject,
      text: business.text,
      html: business.html,
    });

    this.logger.log(`Order emails sent for order ${payload.orderId}`);
  }

  private assertRecipient(email: string, kind: 'customer' | 'business'): void {
    if (!SIMPLE_EMAIL_PATTERN.test(email)) {
      throw new Error(`Invalid ${kind} email recipient`);
    }
  }
}
