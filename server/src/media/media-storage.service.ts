import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { basename, resolve, sep } from 'path';
import type { AppConfig } from '../config/configuration';
import { MEDIA_PUBLIC_PATH_PREFIX } from './constants/media.constants';

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);
  private readonly storageRoot: string;
  private readonly publicPathPrefix: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const media = this.configService.get('media', { infer: true });
    this.storageRoot = resolve(media.storageDir);
    this.publicPathPrefix = MEDIA_PUBLIC_PATH_PREFIX;
  }

  getStorageRoot(): string {
    return this.storageRoot;
  }

  async ensureStorageDirectory(): Promise<void> {
    await mkdir(this.storageRoot, { recursive: true });
  }

  buildPublicPath(filename: string): string {
    return `${this.publicPathPrefix}/${filename}`;
  }

  resolveStoredFilePath(filename: string): string {
    const safeName = basename(filename);
    if (
      safeName.length === 0 ||
      safeName !== filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new InternalServerErrorException('Invalid media filename');
    }

    const absolutePath = resolve(this.storageRoot, safeName);
    const normalizedRoot = resolve(this.storageRoot);

    if (
      absolutePath !== normalizedRoot &&
      !absolutePath.startsWith(`${normalizedRoot}${sep}`)
    ) {
      throw new InternalServerErrorException('Invalid media path');
    }

    return absolutePath;
  }

  async writeFile(filename: string, buffer: Buffer): Promise<void> {
    await this.ensureStorageDirectory();
    const absolutePath = this.resolveStoredFilePath(filename);
    await writeFile(absolutePath, buffer);
  }

  async deleteFile(filename: string): Promise<void> {
    const absolutePath = this.resolveStoredFilePath(filename);
    try {
      await unlink(absolutePath);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        this.logger.warn(`Media file already missing on disk: ${filename}`);
        return;
      }
      throw error;
    }
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      await access(this.resolveStoredFilePath(filename));
      return true;
    } catch {
      return false;
    }
  }
}
