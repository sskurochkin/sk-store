import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { AppConfig } from '../config/configuration';
import { EMAIL_TRANSPORT } from './email.constants';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const email = configService.get('email', { infer: true });

        if (!email.smtpHost) {
          // Local/test fallback — no external network.
          return nodemailer.createTransport({ jsonTransport: true });
        }

        return nodemailer.createTransport({
          host: email.smtpHost,
          port: email.smtpPort,
          secure: email.smtpSecure,
          auth:
            email.smtpUser && email.smtpPassword
              ? {
                  user: email.smtpUser,
                  pass: email.smtpPassword,
                }
              : undefined,
        });
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
