import { INestApplication } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { EmailService } from '../src/email/email.service';
import type { OrderEmailPayload } from '../src/email/types/order-email.type';
import { PrismaService } from '../src/prisma/prisma.service';
import { createAuthTestApp } from './create-auth-test-app';

type OrderBody = {
  id: string;
  status: string;
  totalPrice: string;
  items: Array<{
    productId: string | null;
    productName: string;
    price: string;
    quantity: number;
    totalPrice: string;
  }>;
};

type ProductBody = {
  id: string;
  name: string;
  alias: string;
  price: string;
};

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let emailService: { sendOrderConfirmation: jest.Mock };
  const prefix = `/${GLOBAL_API_PREFIX}`;
  const createdProductIds: string[] = [];
  const createdOrderIds: string[] = [];

  beforeAll(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars';
    }
  });

  beforeEach(async () => {
    emailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };
    app = await createAuthTestApp([
      { provide: EmailService, useValue: emailService },
    ]);
    prisma = app.get(PrismaService);
    createdProductIds.length = 0;
    createdOrderIds.length = 0;
  });

  afterEach(async () => {
    if (createdOrderIds.length > 0) {
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } },
      });
    }
    if (createdProductIds.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: createdProductIds } },
      });
    }
    await app.close();
  });

  async function loginAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    return agent;
  }

  async function createProduct(overrides?: {
    name?: string;
    alias?: string;
    price?: number;
  }): Promise<ProductBody> {
    const agent = await loginAgent();
    const alias =
      overrides?.alias ??
      `order-prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await agent
      .post(`${prefix}/products`)
      .send({
        name: overrides?.name ?? 'Croissant',
        alias,
        description: 'Test product for orders',
        mainPhoto: 'https://example.com/croissant.jpg',
        gallery: [],
        price: overrides?.price ?? 4.5,
      })
      .expect(201);

    const product = response.body as ProductBody;
    createdProductIds.push(product.id);
    return product;
  }

  function trackOrder(body: OrderBody): OrderBody {
    createdOrderIds.push(body.id);
    return body;
  }

  it('POST /orders creates order with NEW status and correct total', async () => {
    const product = await createProduct({ price: 4.5 });

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 3 }],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);
    expect(order.id).toEqual(expect.any(String));
    expect(order.status).toBe('NEW');
    expect(order.totalPrice).toBe('13.50');
    expect(order.items).toEqual([
      {
        productId: product.id,
        productName: 'Croissant',
        price: '4.50',
        quantity: 3,
        totalPrice: '13.50',
      },
    ]);
  });

  it('ignores/rejects client price and totalPrice tampering', async () => {
    const product = await createProduct({ price: 10 });

    // Nested unknown `price` on item — forbidNonWhitelisted → 400
    await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 2, price: '0.01' }],
      })
      .expect(400);

    // Top-level totalPrice — forbidNonWhitelisted → 400
    await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        totalPrice: '0.01',
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(400);

    // Valid payload still uses DB price (10.00 * 2 = 20.00)
    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);
    expect(order.totalPrice).toBe('20.00');
    expect(order.items[0]?.price).toBe('10.00');
  });

  it('sums multiple products with Decimal totals', async () => {
    const a = await createProduct({
      name: 'A',
      alias: `a-${Date.now()}`,
      price: 4.5,
    });
    const b = await createProduct({
      name: 'B',
      alias: `b-${Date.now()}`,
      price: 3,
    });

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [
          { productId: a.id, quantity: 2 },
          { productId: b.id, quantity: 1 },
        ],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);
    expect(order.totalPrice).toBe('12.00');
  });

  it('returns 404 for non-existent product', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: 'missing-product-id', quantity: 1 }],
      })
      .expect(404);
  });

  it('rejects invalid quantities', async () => {
    const product = await createProduct({ alias: `qty-${Date.now()}` });

    for (const quantity of [0, -1, 1.5]) {
      await request(app.getHttpServer())
        .post(`${prefix}/orders`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          userEmail: 'john@example.com',
          userPhone: '+375291234567',
          items: [{ productId: product.id, quantity }],
        })
        .expect(400);
    }
  });

  it('rejects duplicate product IDs', async () => {
    const product = await createProduct({ alias: `dup-${Date.now()}` });

    await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [
          { productId: product.id, quantity: 2 },
          { productId: product.id, quantity: 3 },
        ],
      })
      .expect(400);
  });

  it('keeps OrderItem snapshot after product name/price change', async () => {
    const product = await createProduct({
      name: 'Croissant',
      alias: `snap-${Date.now()}`,
      price: 4.5,
    });

    const createResponse = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(201);

    const order = trackOrder(createResponse.body as OrderBody);

    const agent = await loginAgent();
    await agent
      .patch(`${prefix}/products/${product.id}`)
      .send({ name: 'Changed Croissant', price: 99.99 })
      .expect(200);

    const persisted = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe(OrderStatus.NEW);
    expect(persisted?.totalPrice).toEqual(new Prisma.Decimal('9.00'));
    expect(persisted?.items).toHaveLength(1);
    expect(persisted?.items[0]).toMatchObject({
      productId: product.id,
      productName: 'Croissant',
      quantity: 2,
    });
    expect(persisted?.items[0]?.price).toEqual(new Prisma.Decimal('4.50'));
    expect(persisted?.items[0]?.totalPrice).toEqual(new Prisma.Decimal('9.00'));
  });

  it('sets OrderItem.productId to null after product delete but keeps snapshot', async () => {
    const product = await createProduct({
      name: 'Keep Snapshot',
      alias: `del-${Date.now()}`,
      price: 5.25,
    });

    const createResponse = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(201);

    const order = trackOrder(createResponse.body as OrderBody);

    const agent = await loginAgent();
    await agent.delete(`${prefix}/products/${product.id}`).expect(204);
    // Prevent afterEach from trying to delete already-removed product.
    createdProductIds.splice(createdProductIds.indexOf(product.id), 1);

    const item = await prisma.orderItem.findFirst({
      where: { orderId: order.id },
    });

    expect(item).not.toBeNull();
    expect(item?.productId).toBeNull();
    expect(item?.productName).toBe('Keep Snapshot');
    expect(item?.price).toEqual(new Prisma.Decimal('5.25'));
    expect(item?.quantity).toBe(2);
    expect(item?.totalPrice).toEqual(new Prisma.Decimal('10.50'));
  });

  it('forces NEW status even if client sends status', async () => {
    const product = await createProduct({ alias: `status-${Date.now()}` });

    await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        status: 'COMPLETED',
        items: [{ productId: product.id, quantity: 1 }],
      })
      .expect(400);

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 1 }],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);
    expect(order.status).toBe('NEW');
  });

  it('does not require authentication', async () => {
    const product = await createProduct({ alias: `pub-${Date.now()}` });

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'Jane',
        lastName: 'Roe',
        userEmail: 'jane@example.com',
        userPhone: '+375331112233',
        items: [{ productId: product.id, quantity: 1 }],
      })
      .expect(201);

    trackOrder(response.body as OrderBody);
  });

  it('invokes EmailService with order snapshot after successful create', async () => {
    const product = await createProduct({
      name: 'Croissant',
      alias: `email-ok-${Date.now()}`,
      price: 4.5,
    });

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
    const call = emailService.sendOrderConfirmation.mock.calls[0] as [
      OrderEmailPayload,
    ];
    const payload = call[0];
    expect(payload).toMatchObject({
      orderId: order.id,
      status: 'NEW',
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
      userPhone: '+375291234567',
      totalPrice: '9.00',
      items: [
        {
          productName: 'Croissant',
          quantity: 2,
          unitPrice: '4.50',
          lineTotal: '9.00',
        },
      ],
    });
  });

  it('returns 201 when EmailService fails after order persistence', async () => {
    emailService.sendOrderConfirmation.mockRejectedValue(
      new Error('SMTP unavailable'),
    );

    const product = await createProduct({
      alias: `email-fail-${Date.now()}`,
      price: 4.5,
    });

    const response = await request(app.getHttpServer())
      .post(`${prefix}/orders`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+375291234567',
        items: [{ productId: product.id, quantity: 1 }],
      })
      .expect(201);

    const order = trackOrder(response.body as OrderBody);
    expect(order.status).toBe('NEW');
    expect(emailService.sendOrderConfirmation).toHaveBeenCalled();

    const persisted = await prisma.order.findUnique({
      where: { id: order.id },
    });
    expect(persisted).not.toBeNull();
  });

  it('GET /orders without cookie returns 401', async () => {
    await request(app.getHttpServer()).get(`${prefix}/orders`).expect(401);
  });

  it('admin can list, get, update status, and delete an order', async () => {
    const product = await createProduct({
      alias: `admin-order-${Date.now()}`,
      price: 5,
    });

    const created = trackOrder(
      (
        await request(app.getHttpServer())
          .post(`${prefix}/orders`)
          .send({
            firstName: 'Anna',
            lastName: 'Ivanova',
            userEmail: 'anna@example.com',
            userPhone: '+375291111111',
            items: [{ productId: product.id, quantity: 1 }],
          })
          .expect(201)
      ).body as OrderBody,
    );

    expect(created).not.toHaveProperty('firstName');

    const agent = await loginAgent();

    const list = await agent.get(`${prefix}/orders`).expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    const listed = (list.body as Array<{ id: string; firstName: string }>).find(
      (row) => row.id === created.id,
    );
    expect(listed).toMatchObject({
      id: created.id,
      firstName: 'Anna',
      userEmail: 'anna@example.com',
    });
    expect(listed).not.toHaveProperty('items');

    const detail = await agent
      .get(`${prefix}/orders/${created.id}`)
      .expect(200);
    expect(detail.body).toMatchObject({
      id: created.id,
      firstName: 'Anna',
      lastName: 'Ivanova',
      userPhone: '+375291111111',
      status: 'NEW',
    });
    expect(Array.isArray((detail.body as { items: unknown[] }).items)).toBe(
      true,
    );

    const patched = await agent
      .patch(`${prefix}/orders/${created.id}/status`)
      .send({ status: OrderStatus.PROCESSING })
      .expect(200);
    expect(patched.body).toMatchObject({
      id: created.id,
      status: 'PROCESSING',
      firstName: 'Anna',
    });

    await agent.delete(`${prefix}/orders/${created.id}`).expect(204);
    createdOrderIds.splice(createdOrderIds.indexOf(created.id), 1);

    await agent.get(`${prefix}/orders/${created.id}`).expect(404);
  });

  it('GET /orders/:id unknown returns 404 for admin', async () => {
    const agent = await loginAgent();
    await agent.get(`${prefix}/orders/does-not-exist-999`).expect(404);
  });
});
