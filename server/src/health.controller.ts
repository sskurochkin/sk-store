import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { APP_NAME } from './common/constants/app.constants';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }

    return {
      status: 'ok',
      service: APP_NAME,
    };
  }
}
