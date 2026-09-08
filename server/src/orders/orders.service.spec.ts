import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    product: { findMany: jest.Mock };
    order: { create: jest.Mock };
    $transaction: jest.Mock;
  };

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
    userPhone: '+49123456789',
    items: [{ productId: 'prod-a', quantity: 2 }],
  };

  beforeEach(async () => {
    prisma = {
      product: { findMany: jest.fn() },
      order: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();
  });

  it('creates order with server-side Decimal pricing, snapshots, and NEW status', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockResolvedValue({
      id: 'order-1',
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
      userPhone: '+49123456789',
      totalPrice: new Prisma.Decimal('9.00'),
      status: OrderStatus.NEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          orderId: 'order-1',
          productId: 'prod-a',
          productName: 'Croissant',
          price: new Prisma.Decimal('4.50'),
          quantity: 2,
          totalPrice: new Prisma.Decimal('9.00'),
        },
      ],
    });

    const result = await service.create(validDto);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['prod-a'] } },
    });
    expect(prisma.$transaction).toHaveBeenCalled();

    const createArgs = prisma.order.create.mock.calls as Array<
      [
        {
          data: {
            status: OrderStatus;
            totalPrice: Prisma.Decimal;
            items: {
              create: Array<{
                productId: string;
                productName: string;
                price: Prisma.Decimal;
                quantity: number;
                totalPrice: Prisma.Decimal;
              }>;
            };
          };
        },
      ]
    >;
    const createData = createArgs[0]?.[0].data;
    if (!createData) {
      throw new Error('expected order.create to be called');
    }

    expect(createData.status).toBe(OrderStatus.NEW);
    expect(createData.totalPrice.toFixed(2)).toBe('9.00');
    expect(createData.items.create[0]).toMatchObject({
      productId: 'prod-a',
      productName: 'Croissant',
      quantity: 2,
    });
    expect(createData.items.create[0]?.price.toFixed(2)).toBe('4.50');
    expect(createData.items.create[0]?.totalPrice.toFixed(2)).toBe('9.00');

    expect(result).toEqual({
      id: 'order-1',
      status: 'NEW',
      totalPrice: '9.00',
      items: [
        {
          productId: 'prod-a',
          productName: 'Croissant',
          price: '4.50',
          quantity: 2,
          totalPrice: '9.00',
        },
      ],
    });
  });

  it('calculates multi-item totals with Decimal arithmetic', async () => {
    prisma.product.findMany.mockResolvedValue([productA, productB]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockImplementation(
      (args: { data: { totalPrice: Prisma.Decimal } }) => ({
        id: 'order-2',
        firstName: 'John',
        lastName: 'Doe',
        userEmail: 'john@example.com',
        userPhone: '+49123456789',
        totalPrice: args.data.totalPrice,
        status: OrderStatus.NEW,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            orderId: 'order-2',
            productId: 'prod-a',
            productName: 'Croissant',
            price: new Prisma.Decimal('4.50'),
            quantity: 2,
            totalPrice: new Prisma.Decimal('9.00'),
          },
          {
            id: 'item-2',
            orderId: 'order-2',
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

    // 4.50*2 + 3.00*1 = 12.00
    expect(result.totalPrice).toBe('12.00');
    const multiArgs = prisma.order.create.mock.calls as Array<
      [{ data: { totalPrice: Prisma.Decimal } }]
    >;
    const total = multiArgs[0]?.[0].data.totalPrice;
    if (!total) {
      throw new Error('expected order.create to be called');
    }
    expect(total.toFixed(2)).toBe('12.00');
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
  });

  it('throws NotFoundException when a product is missing', async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await expect(service.create(validDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('uses only DB Product.price for authoritative calculation', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.order.create.mockResolvedValue({
      id: 'order-3',
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
      userPhone: '+49123456789',
      totalPrice: new Prisma.Decimal('9.00'),
      status: OrderStatus.NEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          orderId: 'order-3',
          productId: 'prod-a',
          productName: 'Croissant',
          price: new Prisma.Decimal('4.50'),
          quantity: 2,
          totalPrice: new Prisma.Decimal('9.00'),
        },
      ],
    });

    await service.create(validDto);

    const priceArgs = prisma.order.create.mock.calls as Array<
      [
        {
          data: {
            items: { create: Array<{ price: Prisma.Decimal }> };
            status: OrderStatus;
          };
        },
      ]
    >;
    const line = priceArgs[0]?.[0].data;
    if (!line) {
      throw new Error('expected order.create to be called');
    }
    expect(line.items.create[0]?.price.toFixed(2)).toBe('4.50');
    expect(line.status).toBe(OrderStatus.NEW);
  });

  it('does not swallow unexpected Prisma errors', async () => {
    prisma.product.findMany.mockResolvedValue([productA]);
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('boom', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.create(validDto)).rejects.toBeInstanceOf(
      Prisma.PrismaClientKnownRequestError,
    );
  });
});
