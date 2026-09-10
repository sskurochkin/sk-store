import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LegalPagesService } from './legal-pages.service';

describe('LegalPagesService', () => {
  let service: LegalPagesService;
  let prisma: {
    legalPage: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const samplePage = {
    slug: 'privacy-policy',
    title: 'Privacy',
    sections: [
      {
        id: 'intro',
        title: 'Intro',
        paragraphs: ['Paragraph one'],
      },
    ],
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      legalPage: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalPagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LegalPagesService);
    jest.clearAllMocks();
  });

  it('findBySlug returns page for allowed slug', async () => {
    prisma.legalPage.findUnique.mockResolvedValue(samplePage);

    const result = await service.findBySlug('privacy-policy');

    expect(result.slug).toBe('privacy-policy');
    expect(result.sections).toHaveLength(1);
  });

  it('findBySlug throws for unknown slug', async () => {
    await expect(service.findBySlug('terms')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update throws when page is missing', async () => {
    prisma.legalPage.findUnique.mockResolvedValue(null);

    await expect(
      service.update('privacy-policy', { title: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
