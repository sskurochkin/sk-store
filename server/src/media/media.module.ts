import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import type { AppConfig } from '../config/configuration';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaStorageService } from './media-storage.service';

@Module({
  imports: [
    AuthModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        limits: {
          fileSize: configService.get('media.maxFileSizeBytes', {
            infer: true,
          }),
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaStorageService],
  exports: [MediaService],
})
export class MediaModule {}
