import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Social } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSocialDto } from './dto/create-social.dto';
import type { UpdateSocialDto } from './dto/update-social.dto';
import type { SocialResponse } from './types/social-response.type';

@Injectable()
export class SocialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SocialResponse[]> {
    const items = await this.prisma.social.findMany({
      orderBy: { name: 'asc' },
    });
    return items.map((item) => this.toResponse(item));
  }

  async create(dto: CreateSocialDto): Promise<SocialResponse> {
    const item = await this.prisma.social.create({
      data: {
        name: dto.name.trim(),
        link: dto.link.trim(),
        icon: dto.icon.trim(),
      },
    });
    return this.toResponse(item);
  }

  async update(id: string, dto: UpdateSocialDto): Promise<SocialResponse> {
    await this.ensureExistsById(id);

    const data: Prisma.SocialUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.link !== undefined) {
      data.link = dto.link.trim();
    }
    if (dto.icon !== undefined) {
      data.icon = dto.icon.trim();
    }

    const item = await this.prisma.social.update({
      where: { id },
      data,
    });
    return this.toResponse(item);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExistsById(id);
    await this.prisma.social.delete({ where: { id } });
  }

  private async ensureExistsById(id: string): Promise<void> {
    const existing = await this.prisma.social.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Social not found');
    }
  }

  private toResponse(item: Social): SocialResponse {
    return {
      id: item.id,
      name: item.name,
      link: item.link,
      icon: item.icon,
    };
  }
}
