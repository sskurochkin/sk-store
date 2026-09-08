import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductResponse } from './types/product-response.type';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return products.map((product) => this.toResponse(product));
  }

  async findByAlias(alias: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { alias },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const alias = this.normalizeAlias(dto.alias);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          alias,
          description: dto.description,
          mainPhoto: dto.mainPhoto.trim(),
          gallery: dto.gallery ?? [],
          price: new Prisma.Decimal(dto.price.toFixed(2)),
        },
      });
      return this.toResponse(product);
    } catch (error: unknown) {
      this.rethrowAliasConflict(error);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.ensureExistsById(id);

    const data: Prisma.ProductUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
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
    if (dto.gallery !== undefined) {
      data.gallery = dto.gallery;
    }
    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price.toFixed(2));
    }

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data,
      });
      return this.toResponse(product);
    } catch (error: unknown) {
      this.rethrowAliasConflict(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.ensureExistsById(id);
    await this.prisma.product.delete({ where: { id } });
  }

  private async ensureExistsById(id: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }
  }

  private normalizeAlias(alias: string): string {
    return alias.trim().toLowerCase();
  }

  private toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      alias: product.alias,
      description: product.description,
      mainPhoto: product.mainPhoto,
      gallery: product.gallery,
      price: product.price.toFixed(2),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private rethrowAliasConflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Product alias already exists');
    }

    throw error;
  }
}
