import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { createAuthTestApp } from './create-auth-test-app';

type SocialBody = {
  id: string;
  name: string;
  link: string;
  icon: string;
};

const validSocial = {
  name: 'VK',
  link: 'https://vk.com/skstore',
  icon: 'vk',
};

describe('Socials (e2e)', () => {
  let app: INestApplication<App>;
  const prefix = `/${GLOBAL_API_PREFIX}`;

  beforeAll(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars';
    }
  });

  beforeEach(async () => {
    app = await createAuthTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  async function loginAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    return agent;
  }

  it('GET /socials returns list without auth ordered by name asc', async () => {
    const response = await request(app.getHttpServer())
      .get(`${prefix}/socials`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const list = response.body as SocialBody[];
    const names = list.map((item) => item.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('POST /socials without cookie returns 401', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/socials`)
      .send(validSocial)
      .expect(401);
  });

  it('POST /socials with auth creates social', async () => {
    const agent = await loginAgent();
    const uniqueName = `Test Social ${Date.now()}`;

    const createResponse = await agent
      .post(`${prefix}/socials`)
      .send({ ...validSocial, name: uniqueName })
      .expect(201);

    const created = createResponse.body as SocialBody;
    expect(created).toMatchObject({
      name: uniqueName,
      link: validSocial.link,
      icon: validSocial.icon,
    });
    expect(created.id).toEqual(expect.any(String));

    const list = await request(app.getHttpServer())
      .get(`${prefix}/socials`)
      .expect(200);
    expect(
      (list.body as SocialBody[]).some((item) => item.id === created.id),
    ).toBe(true);

    await agent.delete(`${prefix}/socials/${created.id}`).expect(204);
  });

  it('POST /socials rejects invalid links and missing fields', async () => {
    const agent = await loginAgent();

    await agent
      .post(`${prefix}/socials`)
      .send({ ...validSocial, link: 'javascript:alert(1)' })
      .expect(400);

    await agent
      .post(`${prefix}/socials`)
      .send({ ...validSocial, link: 'example.com/no-protocol' })
      .expect(400);

    await agent
      .post(`${prefix}/socials`)
      .send({ name: 'Only name' })
      .expect(400);
  });

  it('PATCH /socials/:id requires auth and supports partial update', async () => {
    const agent = await loginAgent();
    const uniqueName = `Patch Social ${Date.now()}`;

    const created = (
      await agent
        .post(`${prefix}/socials`)
        .send({ ...validSocial, name: uniqueName })
        .expect(201)
    ).body as SocialBody;

    await request(app.getHttpServer())
      .patch(`${prefix}/socials/${created.id}`)
      .send({ icon: 'updated-icon' })
      .expect(401);

    const updated = await agent
      .patch(`${prefix}/socials/${created.id}`)
      .send({ icon: 'updated-icon' })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.id,
      name: uniqueName,
      icon: 'updated-icon',
    });

    await agent
      .patch(`${prefix}/socials/does-not-exist-id`)
      .send({ name: 'Nope' })
      .expect(404);

    await agent.delete(`${prefix}/socials/${created.id}`).expect(204);
  });

  it('DELETE /socials/:id requires auth and removes social from list', async () => {
    const agent = await loginAgent();
    const uniqueName = `Delete Social ${Date.now()}`;

    const created = (
      await agent
        .post(`${prefix}/socials`)
        .send({ ...validSocial, name: uniqueName })
        .expect(201)
    ).body as SocialBody;

    await request(app.getHttpServer())
      .delete(`${prefix}/socials/${created.id}`)
      .expect(401);

    await agent.delete(`${prefix}/socials/${created.id}`).expect(204);

    const list = await request(app.getHttpServer())
      .get(`${prefix}/socials`)
      .expect(200);
    expect(
      (list.body as SocialBody[]).some((item) => item.id === created.id),
    ).toBe(false);

    await agent.delete(`${prefix}/socials/does-not-exist-id`).expect(404);
  });
});
