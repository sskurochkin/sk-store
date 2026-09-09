import { INestApplication } from '@nestjs/common';
import { ContactRequestStatus } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { PrismaService } from '../src/prisma/prisma.service';
import { createAuthTestApp } from './create-auth-test-app';

type ContactRequestBody = {
  id: string;
  status: string;
  createdAt: string;
};

describe('ContactRequests (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const prefix = `/${GLOBAL_API_PREFIX}`;
  const createdIds: string[] = [];

  const validPayload = {
    firstName: 'Ivan',
    lastName: 'Ivanov',
    phone: '+375291234567',
    email: 'ivan.contact@example.com',
    message: 'Здравствуйте, хочу уточнить ассортимент.',
    consent: true,
  };

  beforeAll(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars';
    }
  });

  beforeEach(async () => {
    app = await createAuthTestApp();
    prisma = app.get(PrismaService);
    createdIds.length = 0;
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prisma.contactRequest.deleteMany({
        where: { id: { in: createdIds } },
      });
    }
    await app.close();
  });

  it('POST /contact-requests creates record with NEW status', async () => {
    const response = await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send(validPayload)
      .expect(201);

    const body = response.body as ContactRequestBody;
    createdIds.push(body.id);

    expect(body.status).toBe('NEW');
    expect(typeof body.id).toBe('string');
    expect(typeof body.createdAt).toBe('string');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('message');

    const row = await prisma.contactRequest.findUniqueOrThrow({
      where: { id: body.id },
    });
    expect(row.status).toBe(ContactRequestStatus.NEW);
    expect(row.firstName).toBe('Ivan');
    expect(row.email).toBe('ivan.contact@example.com');
    expect(row.consent).toBe(true);
  });

  it('rejects missing firstName', async () => {
    const payload: Record<string, unknown> = { ...validPayload };
    delete payload.firstName;
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send(payload)
      .expect(400);
  });

  it('rejects missing lastName', async () => {
    const payload: Record<string, unknown> = { ...validPayload };
    delete payload.lastName;
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send(payload)
      .expect(400);
  });

  it('rejects invalid email', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, email: 'not-an-email' })
      .expect(400);
  });

  it('rejects empty phone', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, phone: '   ' })
      .expect(400);
  });

  it('rejects empty message', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, message: '   ' })
      .expect(400);
  });

  it('rejects message that is too long', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, message: 'x'.repeat(5001) })
      .expect(400);
  });

  it('rejects missing consent', async () => {
    const payload: Record<string, unknown> = { ...validPayload };
    delete payload.consent;
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send(payload)
      .expect(400);
  });

  it('rejects consent false', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, consent: false })
      .expect(400);
  });

  it('rejects unknown fields', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, extra: 'nope' })
      .expect(400);
  });

  it('rejects client-supplied status', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/contact-requests`)
      .send({ ...validPayload, status: 'COMPLETED' })
      .expect(400);
  });

  it('rate limits contact request creation', async () => {
    await app.close();

    process.env.AUTH_LOGIN_RATE_LIMIT = '3';
    process.env.AUTH_LOGIN_RATE_TTL_MS = '60000';
    app = await createAuthTestApp();
    prisma = app.get(PrismaService);

    const server = app.getHttpServer();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await request(server)
        .post(`${prefix}/contact-requests`)
        .send({
          ...validPayload,
          email: `rate-${attempt}@example.com`,
        })
        .expect(201);
      createdIds.push((response.body as ContactRequestBody).id);
    }

    await request(server)
      .post(`${prefix}/contact-requests`)
      .send({
        ...validPayload,
        email: 'rate-overflow@example.com',
      })
      .expect(429);

    process.env.AUTH_LOGIN_RATE_LIMIT = '5';
  });
});
