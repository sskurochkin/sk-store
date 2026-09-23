import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';

jest.mock('sharp', () => {
  return jest.fn((input: Buffer) => ({
    metadata: jest.fn(() =>
      Promise.resolve(
        (() => {
          if (input.toString('utf8') === 'not-an-image') {
            throw new Error('invalid image');
          }
          if (input.toString('utf8').includes('plain-text')) {
            throw new Error('invalid image');
          }
          if (input[0] === 0x89) {
            return { format: 'png', width: 32, height: 32 };
          }
          if (input[0] === 0x52) {
            return { format: 'webp', width: 32, height: 32 };
          }
          return { format: 'jpeg', width: 64, height: 48 };
        })(),
      ),
    ),
  }));
});
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, readdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PrismaService } from '../prisma/prisma.service';
import { MediaStorageService } from './media-storage.service';
import { MediaService } from './media.service';
import {
  createFakeImageBuffer,
  createTestJpegBuffer,
  createTestPngBuffer,
  createTestWebpBuffer,
} from './test-fixtures';

describe('MediaService', () => {
  let service: MediaService;
  let storage: MediaStorageService;
  let storageRoot: string;
  let prisma: {
    media: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    product: {
      findFirst: jest.Mock;
    };
    news: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'sk-store-media-service-'));

    prisma = {
      media: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
      },
      news: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        MediaStorageService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'media.storageDir') {
                return storageRoot;
              }
              if (key === 'media.maxFileSizeBytes') {
                return 10_485_760;
              }
              if (key === 'media') {
                return {
                  storageDir: storageRoot,
                  maxFileSizeBytes: 10_485_760,
                };
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get(MediaService);
    storage = module.get(MediaStorageService);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
  });

  function multerFile(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname,
      encoding: '7bit',
      mimetype,
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: null as never,
    };
  }

  it('rejects missing file', async () => {
    await expect(service.upload(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects oversized file', async () => {
    const buffer = createTestJpegBuffer();
    const file = multerFile(buffer, 'big.jpg', 'image/jpeg');
    file.size = 20_000_000;
    await expect(service.upload(file)).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
  });

  it('rejects unsupported content', async () => {
    const file = multerFile(createFakeImageBuffer(), 'fake.jpg', 'image/jpeg');
    await expect(service.upload(file)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects non-image mime masquerading as jpeg', async () => {
    const file = multerFile(
      Buffer.from('plain-text'),
      'fake.jpg',
      'image/jpeg',
    );
    await expect(service.upload(file)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('uploads valid JPEG and stores metadata', async () => {
    const buffer = createTestJpegBuffer();
    const file = multerFile(buffer, 'bread.jpg', 'image/jpeg');

    prisma.media.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'media-1',
        ...data,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );

    const result = await service.upload(file);

    expect(result.path.startsWith('/media/')).toBe(true);
    expect(result.originalName).toBe('bread.jpg');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.width).toBe(64);
    expect(result.height).toBe(48);
    expect(await storage.fileExists(result.filename)).toBe(true);
  });

  it('uploads valid PNG and WebP', async () => {
    prisma.media.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'media-2',
        ...data,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );

    const png = multerFile(createTestPngBuffer(), 'item.png', 'image/png');
    const webp = multerFile(createTestWebpBuffer(), 'item.webp', 'image/webp');

    const pngResult = await service.upload(png);
    const webpResult = await service.upload(webp);

    expect(pngResult.mimeType).toBe('image/png');
    expect(webpResult.mimeType).toBe('image/webp');
  });

  it('cleans up physical file when DB insert fails', async () => {
    const buffer = createTestJpegBuffer();
    const file = multerFile(buffer, 'cleanup.jpg', 'image/jpeg');
    prisma.media.create.mockRejectedValue(new Error('db failed'));

    await expect(service.upload(file)).rejects.toThrow('db failed');

    const remaining = await readdir(storageRoot);
    expect(remaining).toEqual([]);
  });

  it('returns list sorted by metadata and tolerates missing files', async () => {
    prisma.media.findMany.mockResolvedValue([
      {
        id: 'm1',
        filename: 'missing.webp',
        originalName: 'a.webp',
        mimeType: 'image/webp',
        size: 100,
        path: '/media/missing.webp',
        width: 10,
        height: 10,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ]);

    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('/media/missing.webp');
  });

  it('deletes unused media', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: 'm1',
      filename: 'delete-me.webp',
      originalName: 'delete-me.webp',
      mimeType: 'image/webp',
      size: 100,
      path: '/media/delete-me.webp',
      width: 10,
      height: 10,
      createdAt: new Date(),
    });
    prisma.product.findFirst.mockResolvedValue(null);
    prisma.news.findFirst.mockResolvedValue(null);
    prisma.media.delete.mockResolvedValue({});

    await storage.writeFile('delete-me.webp', Buffer.from('x'));

    await service.remove('m1');

    expect(prisma.media.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(await storage.fileExists('delete-me.webp')).toBe(false);
  });

  it('returns 404 when media missing', async () => {
    prisma.media.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns 409 when media is used by product or news', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: 'm1',
      filename: 'used.webp',
      originalName: 'used.webp',
      mimeType: 'image/webp',
      size: 100,
      path: '/media/used.webp',
      width: 10,
      height: 10,
      createdAt: new Date(),
    });
    prisma.product.findFirst.mockResolvedValueOnce({ id: 'p1' });

    await expect(service.remove('m1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
