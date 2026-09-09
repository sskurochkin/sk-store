import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequestsService } from './contact-requests.service';

@Module({
  imports: [AuthModule],
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
})
export class ContactRequestsModule {}
