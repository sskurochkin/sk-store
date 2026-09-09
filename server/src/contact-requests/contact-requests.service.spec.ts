import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContactRequestsService } from './contact-requests.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';

describe('ContactRequestsService', () => {
  let service: ContactRequestsService;
  let prisma: {
    contactRequest: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
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
  const updatedAt = new Date('2026-09-09T09:00:00.000Z');

  const adminRecord = {
    id: 'req-1',
    firstName: 'Ivan',
    lastName: 'Ivanov',
    phone: '+375291234567',
    email: 'ivan@example.com',
    message: validDto.message,
    consent: true,
    status: ContactRequestStatus.NEW,
    createdAt,
    updatedAt,
  };

  beforeEach(async () => {
    prisma = {
      contactRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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
    expect(result).not.toHaveProperty('firstName');
    expect(result).not.toHaveProperty('message');
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

  it('findAllAdmin returns newest-first admin payloads with PII', async () => {
    prisma.contactRequest.findMany.mockResolvedValue([adminRecord]);

    const result = await service.findAllAdmin();

    expect(prisma.contactRequest.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      {
        id: 'req-1',
        status: ContactRequestStatus.NEW,
        firstName: 'Ivan',
        lastName: 'Ivanov',
        phone: '+375291234567',
        email: 'ivan@example.com',
        message: validDto.message,
        consent: true,
        createdAt,
        updatedAt,
      },
    ]);
  });

  it('findOneAdmin returns admin detail or 404', async () => {
    prisma.contactRequest.findUnique.mockResolvedValue(adminRecord);
    await expect(service.findOneAdmin('req-1')).resolves.toMatchObject({
      id: 'req-1',
      firstName: 'Ivan',
      message: validDto.message,
    });

    prisma.contactRequest.findUnique.mockResolvedValue(null);
    await expect(service.findOneAdmin('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updateStatus updates and returns admin detail', async () => {
    prisma.contactRequest.update.mockResolvedValue({
      ...adminRecord,
      status: ContactRequestStatus.IN_PROGRESS,
    });

    const result = await service.updateStatus(
      'req-1',
      ContactRequestStatus.IN_PROGRESS,
    );

    expect(prisma.contactRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: { status: ContactRequestStatus.IN_PROGRESS },
    });
    expect(result.status).toBe(ContactRequestStatus.IN_PROGRESS);
    expect(result.firstName).toBe('Ivan');
  });

  it('updateStatus maps Prisma P2025 to NotFoundException', async () => {
    prisma.contactRequest.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.updateStatus('missing', ContactRequestStatus.CANCELLED),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove deletes a contact request', async () => {
    prisma.contactRequest.delete.mockResolvedValue(adminRecord);

    await expect(service.remove('req-1')).resolves.toBeUndefined();
    expect(prisma.contactRequest.delete).toHaveBeenCalledWith({
      where: { id: 'req-1' },
    });
  });

  it('remove maps Prisma P2025 to NotFoundException', async () => {
    prisma.contactRequest.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
