import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Prisma } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    product: { findMany: jest.Mock };
    order: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $executeRawUnsafe: jest.Mock;
    $transaction: jest.Mock;
  };
  let emailService: { sendOrderConfirmation: jest.Mock };

  const productA = {
    id: 'prod-a',
    name: 'Croissant',
    alias: 'croissant',
    description: 'Butter croissant',
    mainPhoto: 'https://example.com/c.jpg',
    gallery: [] as string[],
    price: new Prisma.Decimal('4.50'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const productB = {
    ...productA,
    id: 'prod-b',
    name: 'Baguette',
    alias: 'baguette',
    price: new Prisma.Decimal('3.00'),
  };

  const validDto = {
    firstName: 'John',
    lastName: 'Doe',
    userEmail: 'john@example.com',
    userPhone: '+375291234567',
    items: [{ productId: 'prod-a', quantity: 2 }],
  };

  const createdOrder = {
    id: '20260909-1',
    firstName: 'John',
    lastName: 'Doe',
    userEmail: 'john@example.com',
    userPhone: '+375291234567',
    comment: null,
    totalPrice: new Prisma.Decimal('9.00'),
    status: OrderStatus.NEW,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'item-1',
        orderId: '20260909-1',
        productId: 'prod-a',
        productName: 'Croissant',
        price: new Prisma.Decimal('4.50'),
        quantity: 2,
        totalPrice: new Prisma.Decimal('9.00'),
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      product: { findMany: jest.fn() },
      order: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
      $transaction: jest.fn(),
    };
    emailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();
    prisma.order.findMany.mockResolvedValue([]);
    prisma.$executeRawUnsafe.mockResolvedValue(undefined);
  });

  it('creates order then calls EmailService with snapshot payload', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockResolvedValue(createdOrder);

    const result = await service.create(validDto);

    expect(prisma.order.create).toHaveBeenCalled();
    const createCall = prisma.order.create.mock.calls[0] as [
      {
        data: {
          id: string;
          userPhone: string;
          comment: string | null;
        };
      },
    ];
    expect(createCall[0].data.id).toMatch(/^\d{8}-\d+$/);
    expect(createCall[0].data.userPhone).toBe('+375291234567');
    expect(createCall[0].data.comment).toBeNull();
    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith({
      orderId: '20260909-1',
      status: 'NEW',
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
      userPhone: '+375291234567',
      comment: null,
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
    expect(result.id).toBe('20260909-1');
    expect(result.totalPrice).toBe('9.00');
    expect(result.comment).toBeNull();
    expect(result).not.toHaveProperty('firstName');
    expect(result).not.toHaveProperty('userEmail');
  });

  it('lists orders for admin without items, newest first mapping', async () => {
    prisma.order.findMany.mockResolvedValue([
      { ...createdOrder, id: 'newer', createdAt: new Date('2026-09-09') },
      { ...createdOrder, id: 'older', createdAt: new Date('2026-09-08') },
    ]);

    const result = await service.findAllAdmin();

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'newer',
      firstName: 'John',
      userEmail: 'john@example.com',
      totalPrice: '9.00',
    });
    expect(result[0]).not.toHaveProperty('items');
  });

  it('returns admin detail with items', async () => {
    prisma.order.findUnique.mockResolvedValue(createdOrder);

    const result = await service.findOneAdmin('20260909-1');

    expect(result.firstName).toBe('John');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productName).toBe('Croissant');
  });

  it('throws NotFoundException for missing admin detail', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.findOneAdmin('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates order status for admin', async () => {
    prisma.order.update.mockResolvedValue({
      ...createdOrder,
      status: OrderStatus.PROCESSING,
    });

    const result = await service.updateStatus(
      '20260909-1',
      OrderStatus.PROCESSING,
    );

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: '20260909-1' },
      data: { status: OrderStatus.PROCESSING },
      include: { items: true },
    });
    expect(result.status).toBe('PROCESSING');
    expect(result.firstName).toBe('John');
  });

  it('throws NotFoundException when updating missing order', async () => {
    prisma.order.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.updateStatus('missing', OrderStatus.CANCELLED),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes an order', async () => {
    prisma.order.delete.mockResolvedValue(createdOrder);

    await expect(service.remove('20260909-1')).resolves.toBeUndefined();
    expect(prisma.order.delete).toHaveBeenCalledWith({
      where: { id: '20260909-1' },
    });
  });

  it('throws NotFoundException when deleting missing order', async () => {
    prisma.order.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('persists optional comment', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockResolvedValue({
      ...createdOrder,
      comment: 'Leave at the door',
    });

    const result = await service.create({
      ...validDto,
      comment: 'Leave at the door',
    });

    const createCall = prisma.order.create.mock.calls[0] as [
      { data: { comment: string | null } },
    ];
    expect(createCall[0].data.comment).toBe('Leave at the door');
    expect(result.comment).toBe('Leave at the door');
  });

  it('still returns created order when EmailService fails', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockResolvedValue(createdOrder);
    emailService.sendOrderConfirmation.mockRejectedValue(
      new Error('SMTP unavailable'),
    );

    await expect(service.create(validDto)).resolves.toMatchObject({
      id: '20260909-1',
      status: 'NEW',
      totalPrice: '9.00',
    });
    expect(emailService.sendOrderConfirmation).toHaveBeenCalled();
  });

  it('does not call EmailService when transaction fails', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockRejectedValue(new Error('db down'));

    await expect(service.create(validDto)).rejects.toThrow('db down');
    expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('calculates multi-item totals with Decimal arithmetic', async () => {
    prisma.product.findMany.mockResolvedValue([productA, productB]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockImplementation(
      (args: { data: { totalPrice: Prisma.Decimal; id: string } }) => ({
        ...createdOrder,
        id: args.data.id,
        totalPrice: args.data.totalPrice,
        items: [
          createdOrder.items[0],
          {
            id: 'item-2',
            orderId: args.data.id,
            productId: 'prod-b',
            productName: 'Baguette',
            price: new Prisma.Decimal('3.00'),
            quantity: 1,
            totalPrice: new Prisma.Decimal('3.00'),
          },
        ],
      }),
    );

    const result = await service.create({
      ...validDto,
      items: [
        { productId: 'prod-a', quantity: 2 },
        { productId: 'prod-b', quantity: 1 },
      ],
    });

    expect(result.totalPrice).toBe('12.00');
    expect(emailService.sendOrderConfirmation).toHaveBeenCalled();
  });

  it('rejects duplicate product IDs', async () => {
    await expect(
      service.create({
        ...validDto,
        items: [
          { productId: 'prod-a', quantity: 2 },
          { productId: 'prod-a', quantity: 3 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.product.findMany).not.toHaveBeenCalled();
    expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when a product is missing', async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await expect(service.create(validDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
  });
});
