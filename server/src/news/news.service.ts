import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type News } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateNewsDto } from './dto/create-news.dto';
import type { UpdateNewsDto } from './dto/update-news.dto';
import { sanitizeNewsHtml } from './sanitize-news-html';
import type { NewsResponse } from './types/news-response.type';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<NewsResponse[]> {
    const items = await this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.toResponse(item));
  }

  async findByAlias(alias: string): Promise<NewsResponse> {
    const item = await this.prisma.news.findUnique({
      where: { alias },
    });

    if (!item) {
      throw new NotFoundException('News not found');
    }

    return this.toResponse(item);
  }

  async create(dto: CreateNewsDto): Promise<NewsResponse> {
    const alias = this.normalizeAlias(dto.alias);

    try {
      const item = await this.prisma.news.create({
        data: {
          title: dto.title.trim(),
          alias,
          description: dto.description,
          mainPhoto: dto.mainPhoto.trim(),
          content: sanitizeNewsHtml(dto.content),
          tags: this.normalizeTags(dto.tags),
        },
      });
      return this.toResponse(item);
    } catch (error: unknown) {
      this.rethrowAliasConflict(error);
    }
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsResponse> {
    await this.ensureExistsById(id);

    const data: Prisma.NewsUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.alias !== undefined) {
      data.alias = this.normalizeAlias(dto.alias);
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.mainPhoto !== undefined) {
      data.mainPhoto = dto.mainPhoto.trim();
    }
    if (dto.content !== undefined) {
      data.content = sanitizeNewsHtml(dto.content);
    }
    if (dto.tags !== undefined) {
      data.tags = this.normalizeTags(dto.tags);
    }

    try {
      const item = await this.prisma.news.update({
        where: { id },
        data,
      });
      return this.toResponse(item);
    } catch (error: unknown) {
      this.rethrowAliasConflict(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.ensureExistsById(id);
    await this.prisma.news.delete({ where: { id } });
  }

  private async ensureExistsById(id: string): Promise<void> {
    const existing = await this.prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('News not found');
    }
  }

  private normalizeAlias(alias: string): string {
    return alias.trim().toLowerCase();
  }

  private normalizeTags(tags: string[] | undefined): string[] {
    if (!tags || tags.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const result: string[] = [];

    for (const tag of tags) {
      const trimmed = tag.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const key = trimmed.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(trimmed);
    }

    return result;
  }

  private toResponse(item: News): NewsResponse {
    return {
      id: item.id,
      title: item.title,
      alias: item.alias,
      description: item.description,
      mainPhoto: item.mainPhoto,
      content: item.content,
      tags: item.tags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private rethrowAliasConflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('News alias already exists');
    }

    throw error;
  }
}
