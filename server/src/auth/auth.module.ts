import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import type { AppConfig } from '../config/configuration';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const signOptions: NonNullable<JwtModuleOptions['signOptions']> = {
          algorithm: 'HS256',
          expiresIn: configService.get('jwt.expiresIn', {
            infer: true,
          }),
        };

        return {
          secret: configService.get('jwt.secret', { infer: true }),
          signOptions,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => [
        {
          name: 'login',
          ttl: configService.get('auth.loginRateTtlMs', { infer: true }),
          limit: configService.get('auth.loginRateLimit', { infer: true }),
        },
        {
          name: 'publicWrite',
          ttl: configService.get('auth.publicWriteRateTtlMs', {
            infer: true,
          }),
          limit: configService.get('auth.publicWriteRateLimit', {
            infer: true,
          }),
        },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
