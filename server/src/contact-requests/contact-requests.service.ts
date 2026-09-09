import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContactRequest, ContactRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';
import type { AdminContactRequestResponse } from './types/admin-contact-request-response.type';
import type { ContactRequestResponse } from './types/contact-request-response.type';

@Injectable()
export class ContactRequestsService {
  private readonly logger = new Logger(ContactRequestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactRequestDto): Promise<ContactRequestResponse> {
    const record = await this.prisma.contactRequest.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone.trim(),
        email: dto.email.trim(),
        message: dto.message.trim(),
        consent: true,
        // Client cannot set status — always NEW.
        status: ContactRequestStatus.NEW,
      },
    });

    this.logger.log(`Contact request created id=${record.id}`);

    return this.toPublicResponse(record);
  }

  async findAllAdmin(): Promise<AdminContactRequestResponse[]> {
    const records = await this.prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toAdminResponse(record));
  }

  async findOneAdmin(id: string): Promise<AdminContactRequestResponse> {
    const record = await this.prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Contact request not found');
    }

    return this.toAdminResponse(record);
  }

  async updateStatus(
    id: string,
    status: ContactRequestStatus,
  ): Promise<AdminContactRequestResponse> {
    try {
      const record = await this.prisma.contactRequest.update({
        where: { id },
        data: { status },
      });
      return this.toAdminResponse(record);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Contact request not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.contactRequest.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Contact request not found');
      }
      throw error;
    }
  }

  /** Public create response — no customer PII / message. */
  private toPublicResponse(record: ContactRequest): ContactRequestResponse {
    return {
      id: record.id,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private toAdminResponse(record: ContactRequest): AdminContactRequestResponse {
    return {
      id: record.id,
      status: record.status,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
      email: record.email,
      message: record.message,
      consent: record.consent,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
