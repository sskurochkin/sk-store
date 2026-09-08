import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: {
    news: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const sampleNews = {
    id: 'news-1',
    title: 'Autumn Special',
    alias: 'autumn-special',
    description: 'Seasonal bakes',
    mainPhoto: 'https://example.com/news.jpg',
    content: '<p>Fresh <strong>loaves</strong></p>',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      news: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(NewsService);
    jest.clearAllMocks();
  });

  it('findAll returns news ordered by createdAt desc', async () => {
    prisma.news.findMany.mockResolvedValue([sampleNews]);

    const result = await service.findAll();

    expect(prisma.news.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([sampleNews]);
  });

  it('findByAlias throws NotFoundException when missing', async () => {
    prisma.news.findUnique.mockResolvedValue(null);

    await expect(service.findByAlias('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create sanitizes content and normalizes alias', async () => {
    prisma.news.create.mockResolvedValue(sampleNews);

    await service.create({
      title: '  Autumn Special  ',
      alias: 'Autumn-Special',
      description: 'Seasonal bakes',
      mainPhoto: ' https://example.com/news.jpg ',
      content: '<p>Hi</p><script>alert(1)</script>',
    });

    expect(prisma.news.create).toHaveBeenCalledTimes(1);
    const createCall = prisma.news.create.mock.calls[0] as [
      {
        data: {
          title: string;
          alias: string;
          description: string;
          mainPhoto: string;
          content: string;
        };
      },
    ];
    const data = createCall[0].data;

    expect(data.title).toBe('Autumn Special');
    expect(data.alias).toBe('autumn-special');
    expect(data.description).toBe('Seasonal bakes');
    expect(data.mainPhoto).toBe('https://example.com/news.jpg');
    expect(data.content).toContain('<p>Hi</p>');
    expect(data.content).not.toMatch(/script/i);
  });

  it('create maps unique alias conflict to ConflictException', async () => {
    prisma.news.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        title: 'Autumn Special',
        alias: 'autumn-special',
        description: 'Seasonal bakes',
        mainPhoto: 'https://example.com/news.jpg',
        content: '<p>Hi</p>',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update sanitizes content when provided', async () => {
    prisma.news.findUnique.mockResolvedValue({ id: 'news-1' });
    prisma.news.update.mockResolvedValue({
      ...sampleNews,
      content: '<p>Safe</p>',
    });

    await service.update('news-1', {
      content: '<p>Safe</p><img src=x onerror=alert(1)>',
    });

    const updateCall = prisma.news.update.mock.calls[0] as [
      { data: { content: string } },
    ];
    expect(updateCall[0].data.content).not.toMatch(/onerror/i);
    expect(updateCall[0].data.content).not.toMatch(/<img/i);
  });

  it('remove deletes after existence check', async () => {
    prisma.news.findUnique.mockResolvedValue({ id: 'news-1' });
    prisma.news.delete.mockResolvedValue(sampleNews);

    await service.remove('news-1');

    expect(prisma.news.delete).toHaveBeenCalledWith({
      where: { id: 'news-1' },
    });
  });
});
