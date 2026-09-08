import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SocialsService } from './socials.service';

describe('SocialsService', () => {
  let service: SocialsService;
  let prisma: {
    social: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const sampleSocial = {
    id: 'social-1',
    name: 'Instagram',
    link: 'https://instagram.com/skstore',
    icon: 'instagram',
  };

  beforeEach(async () => {
    prisma = {
      social: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SocialsService);
    jest.clearAllMocks();
  });

  it('findAll returns socials ordered by name asc', async () => {
    prisma.social.findMany.mockResolvedValue([sampleSocial]);

    const result = await service.findAll();

    expect(prisma.social.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([sampleSocial]);
  });

  it('create trims fields', async () => {
    prisma.social.create.mockResolvedValue(sampleSocial);

    await service.create({
      name: '  Instagram  ',
      link: ' https://instagram.com/skstore ',
      icon: ' instagram ',
    });

    expect(prisma.social.create).toHaveBeenCalledWith({
      data: {
        name: 'Instagram',
        link: 'https://instagram.com/skstore',
        icon: 'instagram',
      },
    });
  });

  it('update throws NotFoundException for unknown id', async () => {
    prisma.social.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing-id', { name: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove deletes after existence check', async () => {
    prisma.social.findUnique.mockResolvedValue({ id: 'social-1' });
    prisma.social.delete.mockResolvedValue(sampleSocial);

    await service.remove('social-1');

    expect(prisma.social.delete).toHaveBeenCalledWith({
      where: { id: 'social-1' },
    });
  });
});
