import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { createAuthTestApp } from './create-auth-test-app';

type NewsBody = {
  id: string;
  title: string;
  alias: string;
  description: string;
  mainPhoto: string;
  content: string;
};

const validNews = {
  title: 'Weekend Hours',
  alias: 'weekend-hours',
  description: 'Updated bakery hours for the weekend.',
  mainPhoto: 'https://example.com/weekend.jpg',
  content: '<p>We open at <strong>9:00</strong>.</p>',
};

describe('News (e2e)', () => {
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

  it('GET /news returns list without auth', async () => {
    const response = await request(app.getHttpServer())
      .get(`${prefix}/news`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /news/:alias returns 404 for unknown alias', async () => {
    await request(app.getHttpServer())
      .get(`${prefix}/news/does-not-exist-alias`)
      .expect(404);
  });

  it('POST /news without cookie returns 401', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/news`)
      .send(validNews)
      .expect(401);
  });

  it('POST /news with auth creates news and GET by alias works', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `weekend-hours-${Date.now()}`;

    const createResponse = await agent
      .post(`${prefix}/news`)
      .send({ ...validNews, alias: uniqueAlias })
      .expect(201);

    const created = createResponse.body as NewsBody;
    expect(created).toMatchObject({
      title: validNews.title,
      alias: uniqueAlias,
      description: validNews.description,
      mainPhoto: validNews.mainPhoto,
      content: expect.stringContaining('<strong>9:00</strong>') as unknown,
    });
    expect(created.id).toEqual(expect.any(String));

    const getResponse = await request(app.getHttpServer())
      .get(`${prefix}/news/${uniqueAlias}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      id: created.id,
      alias: uniqueAlias,
    });

    await agent.delete(`${prefix}/news/${created.id}`).expect(204);
  });

  it('POST /news sanitizes dangerous HTML', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `dirty-html-${Date.now()}`;

    const createResponse = await agent
      .post(`${prefix}/news`)
      .send({
        ...validNews,
        alias: uniqueAlias,
        content:
          '<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src=x onerror="alert(1)">',
      })
      .expect(201);

    const created = createResponse.body as NewsBody;
    expect(created.content).toContain('<p>Hello</p>');
    expect(created.content).not.toMatch(/<script/i);
    expect(created.content).not.toMatch(/javascript:/i);
    expect(created.content).not.toMatch(/onerror/i);
    expect(created.content).not.toMatch(/<img/i);

    await agent.delete(`${prefix}/news/${created.id}`).expect(204);
  });

  it('POST /news rejects invalid alias and missing fields', async () => {
    const agent = await loginAgent();

    await agent
      .post(`${prefix}/news`)
      .send({ ...validNews, alias: 'Invalid Alias' })
      .expect(400);

    await agent
      .post(`${prefix}/news`)
      .send({
        title: validNews.title,
        alias: 'missing-fields',
      })
      .expect(400);
  });

  it('POST /news returns 409 on duplicate alias', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `dup-news-${Date.now()}`;

    const first = await agent
      .post(`${prefix}/news`)
      .send({ ...validNews, alias: uniqueAlias })
      .expect(201);

    await agent
      .post(`${prefix}/news`)
      .send({ ...validNews, alias: uniqueAlias, title: 'Other' })
      .expect(409);

    const created = first.body as NewsBody;
    await agent.delete(`${prefix}/news/${created.id}`).expect(204);
  });

  it('PATCH /news/:id requires auth, supports partial update, sanitizes content', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `patch-news-${Date.now()}`;

    const createdResponse = await agent
      .post(`${prefix}/news`)
      .send({ ...validNews, alias: uniqueAlias })
      .expect(201);
    const created = createdResponse.body as NewsBody;

    await request(app.getHttpServer())
      .patch(`${prefix}/news/${created.id}`)
      .send({ title: 'Updated Title' })
      .expect(401);

    const updated = await agent
      .patch(`${prefix}/news/${created.id}`)
      .send({
        title: 'Updated Title',
        content: '<p>Safe</p><script>bad()</script>',
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.id,
      title: 'Updated Title',
      alias: uniqueAlias,
    });
    expect((updated.body as NewsBody).content).toContain('<p>Safe</p>');
    expect((updated.body as NewsBody).content).not.toMatch(/script/i);

    await agent
      .patch(`${prefix}/news/does-not-exist-id`)
      .send({ title: 'Nope' })
      .expect(404);

    await agent.delete(`${prefix}/news/${created.id}`).expect(204);
  });

  it('PATCH returns 409 when alias conflicts', async () => {
    const agent = await loginAgent();
    const aliasA = `news-a-${Date.now()}`;
    const aliasB = `news-b-${Date.now()}`;

    const newsA = (
      await agent
        .post(`${prefix}/news`)
        .send({ ...validNews, alias: aliasA })
        .expect(201)
    ).body as NewsBody;

    const newsB = (
      await agent
        .post(`${prefix}/news`)
        .send({ ...validNews, alias: aliasB, title: 'Other' })
        .expect(201)
    ).body as NewsBody;

    await agent
      .patch(`${prefix}/news/${newsB.id}`)
      .send({ alias: aliasA })
      .expect(409);

    await agent.delete(`${prefix}/news/${newsA.id}`).expect(204);
    await agent.delete(`${prefix}/news/${newsB.id}`).expect(204);
  });

  it('DELETE /news/:id requires auth and removes news', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `delete-news-${Date.now()}`;

    const created = (
      await agent
        .post(`${prefix}/news`)
        .send({ ...validNews, alias: uniqueAlias })
        .expect(201)
    ).body as NewsBody;

    await request(app.getHttpServer())
      .delete(`${prefix}/news/${created.id}`)
      .expect(401);

    await agent.delete(`${prefix}/news/${created.id}`).expect(204);

    await request(app.getHttpServer())
      .get(`${prefix}/news/${uniqueAlias}`)
      .expect(404);

    await agent.delete(`${prefix}/news/does-not-exist-id`).expect(404);
  });
});
