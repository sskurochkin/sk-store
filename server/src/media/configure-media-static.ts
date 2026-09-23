import { mkdir } from 'fs/promises';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import type { AppConfig } from '../config/configuration';

export async function configureMediaStatic(
  app: INestApplication,
  configService: ConfigService<AppConfig, true>,
): Promise<void> {
  const mediaDir = configService.get('media', { infer: true }).storageDir;
  await mkdir(mediaDir, { recursive: true });
  app.use(
    '/media',
    express.static(mediaDir, {
      index: false,
      fallthrough: true,
    }),
  );
}
