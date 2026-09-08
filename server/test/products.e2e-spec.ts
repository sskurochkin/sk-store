import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { createAuthTestApp } from './create-auth-test-app';

type ProductBody = {
  id: string;
  name: string;
  alias: string;
  description: string;
  mainPhoto: string;
  gallery: string[];
  price: string;
};

const validProduct = {
  name: 'Rye Bread',
  alias: 'rye-bread',
  description: 'Dense rye loaf.',
  mainPhoto: 'https://example.com/rye.jpg',
  gallery: ['https://example.com/rye-1.jpg'],
  price: 8.25,
};

describe('Products (e2e)', () => {
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

  it('GET /products returns list without auth', async () => {
    const response = await request(app.getHttpServer())
      .get(`${prefix}/products`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /products/:alias returns 404 for unknown alias', async () => {
    await request(app.getHttpServer())
      .get(`${prefix}/products/does-not-exist-alias`)
      .expect(404);
  });

  it('POST /products without cookie returns 401', async () => {
    await request(app.getHttpServer())
      .post(`${prefix}/products`)
      .send(validProduct)
      .expect(401);
  });

  it('POST /products with auth creates product and GET by alias works', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `rye-bread-${Date.now()}`;

    const createResponse = await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: uniqueAlias })
      .expect(201);

    const created = createResponse.body as ProductBody;
    expect(created).toMatchObject({
      name: validProduct.name,
      alias: uniqueAlias,
      description: validProduct.description,
      mainPhoto: validProduct.mainPhoto,
      gallery: validProduct.gallery,
      price: '8.25',
    });
    expect(created.id).toEqual(expect.any(String));

    const getResponse = await request(app.getHttpServer())
      .get(`${prefix}/products/${uniqueAlias}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      id: created.id,
      alias: uniqueAlias,
      price: '8.25',
    });

    await agent.delete(`${prefix}/products/${created.id}`).expect(204);
  });

  it('POST /products rejects invalid alias and non-positive price', async () => {
    const agent = await loginAgent();

    await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: 'Invalid Alias' })
      .expect(400);

    await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: 'valid-alias-zero', price: 0 })
      .expect(400);

    await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: 'valid-alias-neg', price: -1 })
      .expect(400);

    await agent
      .post(`${prefix}/products`)
      .send({
        name: validProduct.name,
        alias: 'missing-fields',
      })
      .expect(400);
  });

  it('POST /products returns 409 on duplicate alias', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `dup-alias-${Date.now()}`;

    const first = await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: uniqueAlias })
      .expect(201);

    await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: uniqueAlias, name: 'Other' })
      .expect(409);

    const created = first.body as ProductBody;
    await agent.delete(`${prefix}/products/${created.id}`).expect(204);
  });

  it('PATCH /products/:id requires auth and supports partial update', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `patch-bread-${Date.now()}`;

    const createdResponse = await agent
      .post(`${prefix}/products`)
      .send({ ...validProduct, alias: uniqueAlias })
      .expect(201);
    const created = createdResponse.body as ProductBody;

    await request(app.getHttpServer())
      .patch(`${prefix}/products/${created.id}`)
      .send({ name: 'Updated Rye' })
      .expect(401);

    const updated = await agent
      .patch(`${prefix}/products/${created.id}`)
      .send({ name: 'Updated Rye', price: 9.5 })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.id,
      name: 'Updated Rye',
      alias: uniqueAlias,
      price: '9.50',
    });

    await agent
      .patch(`${prefix}/products/does-not-exist-id`)
      .send({ name: 'Nope' })
      .expect(404);

    await agent.delete(`${prefix}/products/${created.id}`).expect(204);
  });

  it('PATCH returns 409 when alias conflicts', async () => {
    const agent = await loginAgent();
    const aliasA = `alias-a-${Date.now()}`;
    const aliasB = `alias-b-${Date.now()}`;

    const productA = (
      await agent
        .post(`${prefix}/products`)
        .send({ ...validProduct, alias: aliasA })
        .expect(201)
    ).body as ProductBody;

    const productB = (
      await agent
        .post(`${prefix}/products`)
        .send({ ...validProduct, alias: aliasB, name: 'Other' })
        .expect(201)
    ).body as ProductBody;

    await agent
      .patch(`${prefix}/products/${productB.id}`)
      .send({ alias: aliasA })
      .expect(409);

    await agent.delete(`${prefix}/products/${productA.id}`).expect(204);
    await agent.delete(`${prefix}/products/${productB.id}`).expect(204);
  });

  it('DELETE /products/:id requires auth and removes product', async () => {
    const agent = await loginAgent();
    const uniqueAlias = `delete-bread-${Date.now()}`;

    const created = (
      await agent
        .post(`${prefix}/products`)
        .send({ ...validProduct, alias: uniqueAlias })
        .expect(201)
    ).body as ProductBody;

    await request(app.getHttpServer())
      .delete(`${prefix}/products/${created.id}`)
      .expect(401);

    await agent.delete(`${prefix}/products/${created.id}`).expect(204);

    await request(app.getHttpServer())
      .get(`${prefix}/products/${uniqueAlias}`)
      .expect(404);

    await agent.delete(`${prefix}/products/does-not-exist-id`).expect(404);
  });
});
