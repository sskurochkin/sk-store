import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare } from 'bcrypt';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    admin: {
      findUnique: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };
  let response: { cookie: jest.Mock; clearCookie: jest.Mock };

  beforeEach(async () => {
    prisma = {
      admin: {
        findUnique: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    };
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, unknown> = {
                'cookie.name': 'access_token',
                'cookie.secure': false,
                'cookie.sameSite': 'lax',
                'cookie.maxAgeMs': 86_400_000,
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('logs in with valid credentials and sets cookie without passwordHash', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 'admin-1',
      username: 'admin',
      passwordHash: 'hash',
    });
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login(
      { username: 'admin', password: 'admin123' },
      response as unknown as Response,
    );

    expect(result).toEqual({
      user: { id: 'admin-1', username: 'admin' },
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(result)).not.toContain('hash');
    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'signed-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });

  it('rejects invalid password with generic 401', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 'admin-1',
      username: 'admin',
      passwordHash: 'hash',
    });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login(
        { username: 'admin', password: 'wrong' },
        response as unknown as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects unknown username with generic 401', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    await expect(
      service.login(
        { username: 'nobody', password: 'admin123' },
        response as unknown as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
  });

  it('clears auth cookie on logout', () => {
    const result = service.logout(response as unknown as Response);
    expect(result).toEqual({ success: true });
    expect(response.clearCookie).toHaveBeenCalledWith(
      'access_token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
});
