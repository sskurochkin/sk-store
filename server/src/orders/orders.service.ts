import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
  type Order,
  type OrderItem,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import type { OrderEmailPayload } from '../email/types/order-email.type';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { OrderResponse } from './types/order-response.type';

type OrderWithItems = Order & { items: OrderItem[] };

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderResponse> {
    this.assertUniqueProductIds(dto);

    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    const lineItems = dto.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new NotFoundException('One or more products were not found');
      }

      // Authoritative pricing: Product.price from DB only (Prisma Decimal).
      const price = product.price;
      const totalPrice = price.mul(item.quantity);

      return {
        productId: product.id,
        productName: product.name,
        price,
        quantity: item.quantity,
        totalPrice,
      };
    });

    const orderTotal = lineItems.reduce(
      (sum, item) => sum.add(item.totalPrice),
      new Prisma.Decimal(0),
    );

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          userEmail: dto.userEmail.trim(),
          userPhone: dto.userPhone.trim(),
          totalPrice: orderTotal,
          status: OrderStatus.NEW,
          items: {
            create: lineItems,
          },
        },
        include: {
          items: true,
        },
      });
    });

    // Email is intentionally outside the DB transaction.
    try {
      await this.emailService.sendOrderConfirmation(this.toEmailPayload(order));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(
        `Failed to send order email for order ${order.id}: ${message}`,
      );
    }

    return this.toResponse(order);
  }

  private assertUniqueProductIds(dto: CreateOrderDto): void {
    const ids = dto.items.map((item) => item.productId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        'items must not contain duplicate productId values',
      );
    }
  }

  private toEmailPayload(order: OrderWithItems): OrderEmailPayload {
    return {
      orderId: order.id,
      status: order.status,
      firstName: order.firstName,
      lastName: order.lastName,
      userEmail: order.userEmail,
      userPhone: order.userPhone,
      totalPrice: order.totalPrice.toFixed(2),
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        lineTotal: item.totalPrice.toFixed(2),
      })),
    };
  }

  private toResponse(order: OrderWithItems): OrderResponse {
    return {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice.toFixed(2),
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        totalPrice: item.totalPrice.toFixed(2),
      })),
    };
  }
}
