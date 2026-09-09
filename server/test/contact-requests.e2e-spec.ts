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

  async function loginAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    return agent;
  }

  it('GET /contact-requests without cookie returns 401', async () => {
    await request(app.getHttpServer())
      .get(`${prefix}/contact-requests`)
      .expect(401);
  });

  it('admin can list, get, and update status of a contact request', async () => {
    const created = (
      await request(app.getHttpServer())
        .post(`${prefix}/contact-requests`)
        .send(validPayload)
        .expect(201)
    ).body as ContactRequestBody;
    createdIds.push(created.id);

    expect(created).not.toHaveProperty('firstName');
    expect(created).not.toHaveProperty('message');

    const agent = await loginAgent();

    const list = await agent.get(`${prefix}/contact-requests`).expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    const listed = (
      list.body as Array<{
        id: string;
        firstName: string;
        email: string;
        message: string;
      }>
    ).find((row) => row.id === created.id);
    expect(listed).toMatchObject({
      id: created.id,
      firstName: 'Ivan',
      email: 'ivan.contact@example.com',
      message: validPayload.message,
    });

    const detail = await agent
      .get(`${prefix}/contact-requests/${created.id}`)
      .expect(200);
    expect(detail.body).toMatchObject({
      id: created.id,
      firstName: 'Ivan',
      lastName: 'Ivanov',
      phone: '+375291234567',
      email: 'ivan.contact@example.com',
      message: validPayload.message,
      consent: true,
      status: 'NEW',
    });

    const patched = await agent
      .patch(`${prefix}/contact-requests/${created.id}/status`)
      .send({ status: ContactRequestStatus.IN_PROGRESS })
      .expect(200);
    expect(patched.body).toMatchObject({
      id: created.id,
      status: 'IN_PROGRESS',
      firstName: 'Ivan',
    });

    await agent.delete(`${prefix}/contact-requests/${created.id}`).expect(204);

    await agent.get(`${prefix}/contact-requests/${created.id}`).expect(404);
    createdIds.length = 0;
  });

  it('GET /contact-requests/:id unknown returns 404 for admin', async () => {
    const agent = await loginAgent();
    await agent
      .get(`${prefix}/contact-requests/does-not-exist-999`)
      .expect(404);
  });
});
