import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_API_PREFIX } from './common/constants/app.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import type { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: configService.get('cors.origin', { infer: true }),
    credentials: configService.get('cors.credentials', { infer: true }),
  });

  const port = configService.get('port', { infer: true });
  await app.listen(port);
  logger.log(
    `Server listening on http://localhost:${port}/${GLOBAL_API_PREFIX}`,
  );
}

void bootstrap();
