import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_TRANSPORT } from './email.constants';
import { EmailService } from './email.service';
import type { OrderEmailPayload } from './types/order-email.type';

type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
};

describe('EmailService', () => {
  let service: EmailService;
  let transport: { sendMail: jest.Mock };

  const payload: OrderEmailPayload = {
    orderId: 'order-1',
    status: 'NEW',
    firstName: 'John',
    lastName: 'Doe',
    userEmail: 'john@example.com',
    userPhone: '+49123456789',
    totalPrice: '9.00',
    items: [
      {
        productName: 'Croissant <script>',
        quantity: 2,
        unitPrice: '4.50',
        lineTotal: '9.00',
      },
    ],
  };

  beforeEach(async () => {
    transport = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, string> = {
                'email.from': 'noreply@skstore.local',
                'email.orderNotificationEmail': 'orders@skstore.local',
              };
              return values[key];
            },
          },
        },
        {
          provide: EMAIL_TRANSPORT,
          useValue: transport,
        },
      ],
    }).compile();

    service = module.get(EmailService);
    jest.clearAllMocks();
  });

  it('sends customer confirmation and business notification', async () => {
    await service.sendOrderConfirmation(payload);

    expect(transport.sendMail).toHaveBeenCalledTimes(2);

    const customerCall = transport.sendMail.mock.calls[0] as [MailOptions];
    const businessCall = transport.sendMail.mock.calls[1] as [MailOptions];
    const customerMail = customerCall[0];
    const businessMail = businessCall[0];

    expect(customerMail.from).toBe('noreply@skstore.local');
    expect(customerMail.to).toBe('john@example.com');
    expect(customerMail.subject).toBe('Order confirmation #order-1');
    expect(customerMail.text).toContain('Croissant <script>');
    expect(customerMail.text).toContain('2 × €4.50 = €9.00');
    expect(customerMail.text).toContain('Total: €9.00');
    expect(customerMail.html).toContain('Croissant &lt;script&gt;');
    expect(customerMail.html).not.toContain('<script>');

    expect(businessMail.to).toBe('orders@skstore.local');
    expect(businessMail.subject).toBe('New order #order-1');
    expect(businessMail.text).toContain('john@example.com');
    expect(businessMail.text).toContain('+49123456789');
    expect(businessMail.html).toContain('john@example.com');
  });

  it('includes plain text fallback alongside HTML', async () => {
    await service.sendOrderConfirmation(payload);

    const customerCall = transport.sendMail.mock.calls[0] as [MailOptions];
    const customerMail = customerCall[0];
    expect(customerMail.text.length).toBeGreaterThan(0);
    expect(customerMail.html.length).toBeGreaterThan(0);
  });

  it('rejects malformed customer recipient', async () => {
    await expect(
      service.sendOrderConfirmation({
        ...payload,
        userEmail: 'not-an-email',
      }),
    ).rejects.toThrow('Invalid customer email recipient');

    expect(transport.sendMail).not.toHaveBeenCalled();
  });

  it('propagates transport failure', async () => {
    transport.sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(service.sendOrderConfirmation(payload)).rejects.toThrow(
      'SMTP unavailable',
    );
  });
});
