import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type LegalPage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import type {
  LegalPageResponse,
  LegalSectionResponse,
} from './types/legal-page-response.type';

const ALLOWED_SLUGS = new Set(['privacy-policy', 'cookie-policy']);

function isLegalSection(value: unknown): value is LegalSectionResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    Array.isArray(item.paragraphs) &&
    item.paragraphs.every((paragraph) => typeof paragraph === 'string')
  );
}

function parseSections(value: Prisma.JsonValue): LegalSectionResponse[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isLegalSection).map((section) => ({
    id: section.id.trim(),
    title: section.title.trim(),
    paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()),
  }));
}

@Injectable()
export class LegalPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<LegalPageResponse> {
    if (!ALLOWED_SLUGS.has(slug)) {
      throw new NotFoundException('Legal page not found');
    }

    const item = await this.prisma.legalPage.findUnique({
      where: { slug },
    });

    if (!item) {
      throw new NotFoundException('Legal page not found');
    }

    return this.toResponse(item);
  }

  async update(
    slug: string,
    dto: UpdateLegalPageDto,
  ): Promise<LegalPageResponse> {
    if (!ALLOWED_SLUGS.has(slug)) {
      throw new NotFoundException('Legal page not found');
    }

    await this.ensureExistsBySlug(slug);

    const data: Prisma.LegalPageUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.sections !== undefined) {
      data.sections = dto.sections.map((section) => ({
        id: section.id.trim(),
        title: section.title.trim(),
        paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()),
      }));
    }

    const item = await this.prisma.legalPage.update({
      where: { slug },
      data,
    });

    return this.toResponse(item);
  }

  private async ensureExistsBySlug(slug: string): Promise<void> {
    const existing = await this.prisma.legalPage.findUnique({
      where: { slug },
      select: { slug: true },
    });

    if (!existing) {
      throw new NotFoundException('Legal page not found');
    }
  }

  private toResponse(item: LegalPage): LegalPageResponse {
    return {
      slug: item.slug,
      title: item.title,
      sections: parseSections(item.sections),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
