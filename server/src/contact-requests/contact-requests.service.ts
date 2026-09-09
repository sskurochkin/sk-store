import { Injectable, Logger } from '@nestjs/common';
import { ContactRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';
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

    return {
      id: record.id,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
