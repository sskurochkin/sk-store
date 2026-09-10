import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HomeBenefitsService } from './home-benefits.service';

describe('HomeBenefitsService', () => {
  let service: HomeBenefitsService;
  let prisma: {
    homeBenefit: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const sampleBenefit = {
    id: 'benefit-1',
    title: 'Fresh',
    description: 'Daily baking',
    icon: 'i-calendar',
    sortOrder: 0,
  };

  beforeEach(async () => {
    prisma = {
      homeBenefit: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeBenefitsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(HomeBenefitsService);
    jest.clearAllMocks();
  });

  it('findAll returns benefits ordered by sortOrder', async () => {
    prisma.homeBenefit.findMany.mockResolvedValue([sampleBenefit]);

    const result = await service.findAll();

    expect(prisma.homeBenefit.findMany).toHaveBeenCalledWith({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    expect(result).toEqual([sampleBenefit]);
  });

  it('create trims fields', async () => {
    prisma.homeBenefit.create.mockResolvedValue(sampleBenefit);

    await service.create({
      title: '  Fresh  ',
      description: ' Daily baking ',
      icon: ' i-calendar ',
      sortOrder: 0,
    });

    expect(prisma.homeBenefit.create).toHaveBeenCalledWith({
      data: {
        title: 'Fresh',
        description: 'Daily baking',
        icon: 'i-calendar',
        sortOrder: 0,
      },
    });
  });

  it('update throws NotFoundException for unknown id', async () => {
    prisma.homeBenefit.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing-id', { title: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
