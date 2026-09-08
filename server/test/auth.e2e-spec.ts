import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { createAuthTestApp } from './create-auth-test-app';

type AuthUserBody = {
  id: string;
  username: string;
};

type LoginResponseBody = {
  user: AuthUserBody;
};

type ErrorBody = {
  message: string;
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const prefix = `/${GLOBAL_API_PREFIX}`;

  beforeAll(() => {
    process.env.AUTH_LOGIN_RATE_LIMIT = '5';
    process.env.AUTH_LOGIN_RATE_TTL_MS = '60000';
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

  function assertNoSensitiveData(body: unknown): void {
    const serialized = JSON.stringify(body);
    expect(serialized).not.toMatch(/passwordHash/i);
    expect(serialized).not.toMatch(/"password"\s*:/);
    expect(serialized).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  }

  it('login success sets HttpOnly cookie and returns user without passwordHash', async () => {
    const response = await request(app.getHttpServer())
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    const body = response.body as LoginResponseBody;
    expect(body).toMatchObject({
      user: {
        username: 'admin',
      },
    });
    expect(body.user.id).toEqual(expect.any(String));
    assertNoSensitiveData(body);

    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie)
      ? setCookie.join(';')
      : setCookie;
    expect(cookieHeader).toMatch(/access_token=/);
    expect(cookieHeader.toLowerCase()).toContain('httponly');
  });

  it('login with wrong password returns 401', async () => {
    const response = await request(app.getHttpServer())
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'wrong-password' })
      .expect(401);

    expect((response.body as ErrorBody).message).toBe('Invalid credentials');
    assertNoSensitiveData(response.body);
  });

  it('login with unknown username returns 401', async () => {
    const response = await request(app.getHttpServer())
      .post(`${prefix}/auth/login`)
      .send({ username: 'does-not-exist', password: 'admin123' })
      .expect(401);

    expect((response.body as ErrorBody).message).toBe('Invalid credentials');
  });

  it('GET /me without cookie returns 401', async () => {
    await request(app.getHttpServer()).get(`${prefix}/auth/me`).expect(401);
  });

  it('GET /me with valid cookie returns current admin', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    const me = await agent.get(`${prefix}/auth/me`).expect(200);
    const body = me.body as AuthUserBody;
    expect(body).toMatchObject({ username: 'admin' });
    expect(body.id).toEqual(expect.any(String));
    assertNoSensitiveData(body);
  });

  it('GET /me with invalid cookie returns 401', async () => {
    await request(app.getHttpServer())
      .get(`${prefix}/auth/me`)
      .set('Cookie', 'access_token=not-a-valid-jwt')
      .expect(401);
  });

  it('logout clears cookie and subsequent /me returns 401', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    const logout = await agent.post(`${prefix}/auth/logout`).expect(200);
    expect(logout.body).toEqual({ success: true });

    const setCookie = logout.headers['set-cookie'];
    if (setCookie) {
      const cookieHeader = Array.isArray(setCookie)
        ? setCookie.join(';')
        : setCookie;
      expect(cookieHeader.toLowerCase()).toMatch(/access_token=/);
    }

    await agent.get(`${prefix}/auth/me`).expect(401);
  });

  it('login endpoint is rate limited', async () => {
    await app.close();

    process.env.AUTH_LOGIN_RATE_LIMIT = '3';
    process.env.AUTH_LOGIN_RATE_TTL_MS = '60000';
    app = await createAuthTestApp();

    const server = app.getHttpServer();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await request(server)
        .post(`${prefix}/auth/login`)
        .send({ username: 'admin', password: 'wrong-password' })
        .expect(401);
    }

    await request(server)
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'wrong-password' })
      .expect(429);

    process.env.AUTH_LOGIN_RATE_LIMIT = '5';
  });
});
