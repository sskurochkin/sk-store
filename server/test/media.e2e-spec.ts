import { INestApplication } from '@nestjs/common';
import { access, mkdir, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import request from 'supertest';
import { App } from 'supertest/types';
import { GLOBAL_API_PREFIX } from '../src/common/constants/app.constants';
import { PrismaService } from '../src/prisma/prisma.service';
import { MediaStorageService } from '../src/media/media-storage.service';
import {
  createTestJpegBuffer,
  createFakeImageBuffer,
} from '../src/media/test-fixtures';
import { createAuthTestApp } from './create-auth-test-app';

type MediaBody = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  path: string;
  createdAt: string;
};

describe('Media (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storageDir: string;
  const prefix = `/${GLOBAL_API_PREFIX}`;
  const createdMediaIds: string[] = [];

  beforeAll(async () => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars';
    }
    storageDir = await mkdtemp(join(tmpdir(), 'sk-store-media-e2e-'));
    process.env.MEDIA_STORAGE_DIR = storageDir;
    process.env.MEDIA_MAX_FILE_SIZE = '10485760';
  });

  beforeEach(async () => {
    process.env.MEDIA_STORAGE_DIR = storageDir;
    await mkdir(storageDir, { recursive: true });
    app = await createAuthTestApp();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    if (createdMediaIds.length > 0) {
      await prisma.media.deleteMany({
        where: { id: { in: createdMediaIds.splice(0) } },
      });
    }
    await app.close();
  });

  afterAll(async () => {
    await rm(storageDir, { recursive: true, force: true });
    delete process.env.MEDIA_STORAGE_DIR;
  });

  async function loginAgent() {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post(`${prefix}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    return agent;
  }

  it('POST /media/upload without auth returns 401', async () => {
    const buffer = createTestJpegBuffer();
    await request(app.getHttpServer())
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'bread.jpg')
      .expect(401);
  });

  it('POST /media/upload rejects missing and invalid files', async () => {
    const agent = await loginAgent();

    await agent.post(`${prefix}/media/upload`).expect(400);

    await agent
      .post(`${prefix}/media/upload`)
      .attach('file', createFakeImageBuffer(), 'fake.jpg')
      .expect(400);
  });

  it('POST /media/upload with auth stores JPEG and serves it publicly', async () => {
    const agent = await loginAgent();
    const buffer = createTestJpegBuffer();

    const uploadResponse = await agent
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'bread.jpg')
      .expect(201);

    const body = uploadResponse.body as MediaBody;
    createdMediaIds.push(body.id);

    expect(body.path.startsWith('/media/')).toBe(true);
    expect(body.mimeType).toBe('image/jpeg');
    expect(body.originalName).toBe('bread.jpg');
    expect(body.width).toBeGreaterThan(0);
    expect(body.height).toBeGreaterThan(0);

    const storage = app.get(MediaStorageService);
    expect(storage.getStorageRoot()).toBe(storageDir);
    await access(`${storageDir}/${body.filename}`);

    await request(app.getHttpServer()).get(body.path).expect(200);

    const listResponse = await agent.get(`${prefix}/media`).expect(200);
    const list = listResponse.body as MediaBody[];
    expect(list.some((item) => item.id === body.id)).toBe(true);
  });

  it('DELETE /media/:id removes unused media', async () => {
    const agent = await loginAgent();
    const buffer = createTestJpegBuffer();

    const uploadResponse = await agent
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'delete-me.jpg')
      .expect(201);

    const body = uploadResponse.body as MediaBody;

    await agent.delete(`${prefix}/media/${body.id}`).expect(204);
    await request(app.getHttpServer()).get(body.path).expect(404);
  });

  it('DELETE /media/:id returns 409 when media path is used by product gallery', async () => {
    const agent = await loginAgent();
    const buffer = createTestJpegBuffer();

    const uploadResponse = await agent
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'gallery-used.jpg')
      .expect(201);

    const body = uploadResponse.body as MediaBody;
    createdMediaIds.push(body.id);

    const product = await prisma.product.create({
      data: {
        name: 'Gallery media usage',
        alias: `media-gallery-${Date.now()}`,
        description: 'Test',
        mainPhoto: 'https://example.com/other.jpg',
        gallery: [body.path],
        price: '10.00',
      },
    });

    await agent.delete(`${prefix}/media/${body.id}`).expect(409);

    await prisma.product.delete({ where: { id: product.id } });
  });

  it('DELETE /media/:id returns 409 when media path is used by news', async () => {
    const agent = await loginAgent();
    const buffer = createTestJpegBuffer();

    const uploadResponse = await agent
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'news-used.jpg')
      .expect(201);

    const body = uploadResponse.body as MediaBody;
    createdMediaIds.push(body.id);

    const news = await prisma.news.create({
      data: {
        title: 'News media usage',
        alias: `media-news-${Date.now()}`,
        description: 'Test',
        mainPhoto: body.path,
        content: '<p>Test</p>',
        tags: [],
      },
    });

    await agent.delete(`${prefix}/media/${body.id}`).expect(409);

    await prisma.news.delete({ where: { id: news.id } });
  });

  it('DELETE /media/:id returns 409 when media path is used by product mainPhoto', async () => {
    const agent = await loginAgent();
    const buffer = createTestJpegBuffer();

    const uploadResponse = await agent
      .post(`${prefix}/media/upload`)
      .attach('file', buffer, 'used.jpg')
      .expect(201);

    const body = uploadResponse.body as MediaBody;
    createdMediaIds.push(body.id);

    const product = await prisma.product.create({
      data: {
        name: 'Media usage product',
        alias: `media-usage-${Date.now()}`,
        description: 'Test',
        mainPhoto: body.path,
        gallery: [],
        price: '10.00',
      },
    });

    await agent.delete(`${prefix}/media/${body.id}`).expect(409);

    await prisma.product.delete({ where: { id: product.id } });
  });

  it('DELETE /media/:id returns 404 for unknown id', async () => {
    const agent = await loginAgent();
    await agent.delete(`${prefix}/media/does-not-exist`).expect(404);
  });
});
