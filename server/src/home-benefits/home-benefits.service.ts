import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type HomeBenefit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateHomeBenefitDto } from './dto/create-home-benefit.dto';
import type { UpdateHomeBenefitDto } from './dto/update-home-benefit.dto';
import type { HomeBenefitResponse } from './types/home-benefit-response.type';

@Injectable()
export class HomeBenefitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<HomeBenefitResponse[]> {
    const items = await this.prisma.homeBenefit.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    return items.map((item) => this.toResponse(item));
  }

  async create(dto: CreateHomeBenefitDto): Promise<HomeBenefitResponse> {
    const item = await this.prisma.homeBenefit.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        icon: dto.icon.trim(),
        sortOrder: dto.sortOrder,
      },
    });
    return this.toResponse(item);
  }

  async update(
    id: string,
    dto: UpdateHomeBenefitDto,
  ): Promise<HomeBenefitResponse> {
    await this.ensureExistsById(id);

    const data: Prisma.HomeBenefitUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.icon !== undefined) {
      data.icon = dto.icon.trim();
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    const item = await this.prisma.homeBenefit.update({
      where: { id },
      data,
    });
    return this.toResponse(item);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExistsById(id);
    await this.prisma.homeBenefit.delete({ where: { id } });
  }

  private async ensureExistsById(id: string): Promise<void> {
    const existing = await this.prisma.homeBenefit.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Home benefit not found');
    }
  }

  private toResponse(item: HomeBenefit): HomeBenefitResponse {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      sortOrder: item.sortOrder,
    };
  }
}
