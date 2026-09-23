import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { basename } from 'path';
import sharp from 'sharp';
import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEDIA_ALLOWED_FORMATS,
  MEDIA_EXTENSION_BY_FORMAT,
  MEDIA_MIME_BY_FORMAT,
  type MediaImageFormat,
} from './constants/media.constants';
import { MediaStorageService } from './media-storage.service';
import type {
  MediaRecord,
  MediaResponse,
  ValidatedUploadImage,
} from './types/media.types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly maxFileSizeBytes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.maxFileSizeBytes = this.configService.get('media.maxFileSizeBytes', {
      infer: true,
    });
  }

  async upload(file: Express.Multer.File | undefined): Promise<MediaResponse> {
    if (!file) {
      throw new BadRequestException('Upload field "file" is required');
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new PayloadTooLargeException(
        `File exceeds maximum size of ${this.maxFileSizeBytes} bytes`,
      );
    }

    const validated = await this.validateImage(file.buffer);
    const filename = `${randomUUID()}.${validated.extension}`;
    const path = this.storage.buildPublicPath(filename);

    await this.storage.writeFile(filename, validated.buffer);

    try {
      const record = await this.prisma.media.create({
        data: {
          filename,
          originalName: this.sanitizeOriginalName(file.originalname),
          mimeType: validated.mimeType,
          size: validated.buffer.length,
          path,
          width: validated.width,
          height: validated.height,
        },
      });

      return this.toResponse(record);
    } catch (error: unknown) {
      await this.storage.deleteFile(filename);
      throw error;
    }
  }

  async findAll(): Promise<MediaResponse[]> {
    const records = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const responses: MediaResponse[] = [];

    for (const record of records) {
      const exists = await this.storage.fileExists(record.filename);
      if (!exists) {
        this.logger.warn(
          `Media record ${record.id} references missing file ${record.filename}`,
        );
      }
      responses.push(this.toResponse(record));
    }

    return responses;
  }

  async remove(id: string): Promise<void> {
    const record = await this.prisma.media.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Media not found');
    }

    const inUse = await this.isMediaPathInUse(record.path);
    if (inUse) {
      throw new ConflictException(
        'Media file is currently used by one or more entities',
      );
    }

    await this.storage.deleteFile(record.filename);
    await this.prisma.media.delete({ where: { id } });
  }

  async isMediaPathInUse(path: string): Promise<boolean> {
    const [productMain, productGallery, newsMain] = await Promise.all([
      this.prisma.product.findFirst({
        where: { mainPhoto: path },
        select: { id: true },
      }),
      this.prisma.product.findFirst({
        where: { gallery: { has: path } },
        select: { id: true },
      }),
      this.prisma.news.findFirst({
        where: { mainPhoto: path },
        select: { id: true },
      }),
    ]);

    return Boolean(productMain || productGallery || newsMain);
  }

  private async validateImage(buffer: Buffer): Promise<ValidatedUploadImage> {
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer, { failOn: 'error' }).metadata();
    } catch {
      throw new BadRequestException('Invalid image file');
    }

    const format = metadata.format;
    if (!format || !this.isAllowedFormat(format)) {
      throw new UnsupportedMediaTypeException(
        'Unsupported image type. Allowed: JPEG, PNG, WebP',
      );
    }

    const allowedFormat: MediaImageFormat = format;

    return {
      format: allowedFormat,
      mimeType: MEDIA_MIME_BY_FORMAT[allowedFormat],
      extension: MEDIA_EXTENSION_BY_FORMAT[allowedFormat],
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      buffer,
    };
  }

  private isAllowedFormat(format: string): format is MediaImageFormat {
    return (MEDIA_ALLOWED_FORMATS as readonly string[]).includes(format);
  }

  private sanitizeOriginalName(originalName: string): string {
    const base = basename(originalName || 'upload');
    const sanitized = base.replace(/[^\w.\-() ]+/g, '_').trim();
    return sanitized.slice(0, 255) || 'upload';
  }

  private toResponse(record: MediaRecord): MediaResponse {
    return {
      id: record.id,
      filename: record.filename,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      width: record.width,
      height: record.height,
      path: record.path,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
