import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const sampleProduct = {
    id: 'prod-1',
    name: 'Sourdough Loaf',
    alias: 'sourdough-loaf',
    description: 'A loaf',
    mainPhoto: 'https://example.com/a.jpg',
    gallery: ['https://example.com/b.jpg'],
    price: new Prisma.Decimal('12.50'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProductsService);
    jest.clearAllMocks();
  });

  it('findAll returns products ordered by createdAt desc with string price', async () => {
    prisma.product.findMany.mockResolvedValue([sampleProduct]);

    const result = await service.findAll();

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      {
        ...sampleProduct,
        price: '12.50',
      },
    ]);
  });

  it('findByAlias throws NotFoundException when missing', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findByAlias('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create persists normalized alias and decimal price', async () => {
    prisma.product.create.mockResolvedValue(sampleProduct);

    const result = await service.create({
      name: '  Sourdough Loaf  ',
      alias: 'Sourdough-Loaf',
      description: 'A loaf',
      mainPhoto: ' https://example.com/a.jpg ',
      gallery: ['https://example.com/b.jpg'],
      price: 12.5,
    });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Sourdough Loaf',
        alias: 'sourdough-loaf',
        description: 'A loaf',
        mainPhoto: 'https://example.com/a.jpg',
        gallery: ['https://example.com/b.jpg'],
        price: new Prisma.Decimal('12.50'),
      },
    });
    expect(result.price).toBe('12.50');
  });

  it('create maps unique alias conflict to ConflictException', async () => {
    prisma.product.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        name: 'Sourdough Loaf',
        alias: 'sourdough-loaf',
        description: 'A loaf',
        mainPhoto: 'https://example.com/a.jpg',
        price: 12.5,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update throws NotFoundException for unknown id', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing-id', { name: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove deletes after existence check', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
    prisma.product.delete.mockResolvedValue(sampleProduct);

    await service.remove('prod-1');

    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
    });
  });
});
