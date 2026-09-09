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
  type PrismaClient,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import type { OrderEmailPayload } from '../email/types/order-email.type';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import {
  getMinskDateKey,
  nextDailyOrderId,
  ORDER_ID_ADVISORY_LOCK_KEY1,
} from './order-id';
import type {
  AdminOrderListItem,
  AdminOrderResponse,
} from './types/admin-order-response.type';
import type {
  OrderItemResponse,
  OrderResponse,
} from './types/order-response.type';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

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
      const orderId = await this.allocateDailyOrderId(tx);

      return tx.order.create({
        data: {
          id: orderId,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          userEmail: dto.userEmail.trim(),
          userPhone: dto.userPhone.trim(),
          comment: dto.comment?.trim() || null,
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

    return this.toPublicResponse(order);
  }

  async findAllAdmin(): Promise<AdminOrderListItem[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toAdminListItem(order));
  }

  async findOneAdmin(id: string): Promise<AdminOrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toAdminResponse(order);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<AdminOrderResponse> {
    try {
      const order = await this.prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });
      return this.toAdminResponse(order);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.order.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  private async allocateDailyOrderId(tx: TransactionClient): Promise<string> {
    const dateKey = getMinskDateKey();
    const dateLockKey = Number(dateKey);

    await tx.$executeRawUnsafe(
      'SELECT pg_advisory_xact_lock($1::int4, $2::int4)',
      ORDER_ID_ADVISORY_LOCK_KEY1,
      dateLockKey,
    );

    const existing = await tx.order.findMany({
      where: { id: { startsWith: `${dateKey}-` } },
      select: { id: true },
    });

    return nextDailyOrderId(
      dateKey,
      existing.map((row) => row.id),
    );
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
      comment: order.comment,
      totalPrice: order.totalPrice.toFixed(2),
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        lineTotal: item.totalPrice.toFixed(2),
      })),
    };
  }

  /** Public create response — no customer PII. */
  private toPublicResponse(order: OrderWithItems): OrderResponse {
    return {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice.toFixed(2),
      comment: order.comment,
      items: order.items.map((item) => this.toItemResponse(item)),
    };
  }

  private toAdminListItem(order: Order): AdminOrderListItem {
    return {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice.toFixed(2),
      comment: order.comment,
      firstName: order.firstName,
      lastName: order.lastName,
      userEmail: order.userEmail,
      userPhone: order.userPhone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toAdminResponse(order: OrderWithItems): AdminOrderResponse {
    return {
      ...this.toAdminListItem(order),
      items: order.items.map((item) => this.toItemResponse(item)),
    };
  }

  private toItemResponse(item: OrderItem): OrderItemResponse {
    return {
      productId: item.productId,
      productName: item.productName,
      price: item.price.toFixed(2),
      quantity: item.quantity,
      totalPrice: item.totalPrice.toFixed(2),
    };
  }
}
