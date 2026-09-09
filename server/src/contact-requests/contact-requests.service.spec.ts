import { Test, TestingModule } from '@nestjs/testing';
import { ContactRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContactRequestsService } from './contact-requests.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';

describe('ContactRequestsService', () => {
  let service: ContactRequestsService;
  let prisma: {
    contactRequest: { create: jest.Mock };
  };

  const validDto: CreateContactRequestDto = {
    firstName: 'Ivan',
    lastName: 'Ivanov',
    phone: '+375291234567',
    email: 'ivan@example.com',
    message: 'Здравствуйте, хочу уточнить наличие.',
    consent: true,
  };

  const createdAt = new Date('2026-09-09T08:00:00.000Z');

  beforeEach(async () => {
    prisma = {
      contactRequest: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ContactRequestsService);
    jest.clearAllMocks();
  });

  it('creates a contact request with status NEW and consent true', async () => {
    prisma.contactRequest.create.mockResolvedValue({
      id: 'req-1',
      ...validDto,
      status: ContactRequestStatus.NEW,
      createdAt,
      updatedAt: createdAt,
    });

    const result = await service.create(validDto);

    expect(prisma.contactRequest.create).toHaveBeenCalledWith({
      data: {
        firstName: 'Ivan',
        lastName: 'Ivanov',
        phone: '+375291234567',
        email: 'ivan@example.com',
        message: validDto.message,
        consent: true,
        status: ContactRequestStatus.NEW,
      },
    });
    expect(result).toEqual({
      id: 'req-1',
      status: 'NEW',
      createdAt: createdAt.toISOString(),
    });
  });

  it('ignores any client-provided status by always writing NEW', async () => {
    const dtoWithStatus = {
      ...validDto,
      status: 'COMPLETED',
    } as CreateContactRequestDto & { status: string };

    prisma.contactRequest.create.mockResolvedValue({
      id: 'req-2',
      ...validDto,
      status: ContactRequestStatus.NEW,
      createdAt,
      updatedAt: createdAt,
    });

    await service.create(dtoWithStatus);

    const createCall = prisma.contactRequest.create.mock.calls[0] as [
      { data: { status: ContactRequestStatus; consent: boolean } },
    ];
    expect(createCall[0].data.status).toBe(ContactRequestStatus.NEW);
    expect(createCall[0].data.consent).toBe(true);
  });

  it('trims fields before persistence', async () => {
    prisma.contactRequest.create.mockResolvedValue({
      id: 'req-3',
      ...validDto,
      status: ContactRequestStatus.NEW,
      createdAt,
      updatedAt: createdAt,
    });

    await service.create({
      firstName: '  Ivan  ',
      lastName: '  Ivanov  ',
      phone: '  +375291234567  ',
      email: '  ivan@example.com  ',
      message: `  ${validDto.message}  `,
      consent: true,
    });

    expect(prisma.contactRequest.create).toHaveBeenCalledWith({
      data: {
        firstName: 'Ivan',
        lastName: 'Ivanov',
        phone: '+375291234567',
        email: 'ivan@example.com',
        message: validDto.message,
        consent: true,
        status: ContactRequestStatus.NEW,
      },
    });
  });
});
