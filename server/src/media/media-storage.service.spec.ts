import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { MediaStorageService } from './media-storage.service';

describe('MediaStorageService', () => {
  let service: MediaStorageService;
  let storageRoot: string;

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'sk-store-media-storage-'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaStorageService,
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

    service = module.get(MediaStorageService);
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
  });

  it('writes and deletes files with generated safe names', async () => {
    const filename = 'abc123.webp';
    await service.writeFile(filename, Buffer.from('webp-data'));
    expect(await service.fileExists(filename)).toBe(true);
    await service.deleteFile(filename);
    expect(await service.fileExists(filename)).toBe(false);
  });

  it('builds public paths under /media', () => {
    expect(service.buildPublicPath('file.webp')).toBe('/media/file.webp');
  });

  it('rejects path traversal filenames', () => {
    expect(() => service.resolveStoredFilePath('../secret.txt')).toThrow();
    expect(() => service.resolveStoredFilePath('nested/file.webp')).toThrow();
  });
});
