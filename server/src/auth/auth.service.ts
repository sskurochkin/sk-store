import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { CookieOptions, Response } from 'express';
import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { AuthUser } from './types/auth-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async login(dto: LoginDto, response: Response): Promise<{ user: AuthUser }> {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      username: admin.username,
    });

    response.cookie(this.getCookieName(), accessToken, this.getCookieOptions());

    return {
      user: {
        id: admin.id,
        username: admin.username,
      },
    };
  }

  logout(response: Response): { success: true } {
    response.clearCookie(this.getCookieName(), this.getCookieOptions());
    return { success: true };
  }

  me(user: AuthUser): AuthUser {
    return user;
  }

  private getCookieName(): string {
    return this.configService.get('cookie.name', { infer: true });
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get('cookie.secure', { infer: true }),
      sameSite: this.configService.get('cookie.sameSite', { infer: true }),
      maxAge: this.configService.get('cookie.maxAgeMs', { infer: true }),
      path: '/',
    };
  }
}
