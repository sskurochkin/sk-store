import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { EmailModule } from './email/email.module';
import { HealthController } from './health.controller';
import { NewsModule } from './news/news.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SocialsModule } from './socials/socials.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    AdminsModule,
    ProductsModule,
    NewsModule,
    OrdersModule,
    ContactRequestsModule,
    SocialsModule,
    EmailModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
