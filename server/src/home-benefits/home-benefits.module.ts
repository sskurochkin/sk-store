import { Module } from '@nestjs/common';
import { HomeBenefitsController } from './home-benefits.controller';
import { HomeBenefitsService } from './home-benefits.service';

@Module({
  controllers: [HomeBenefitsController],
  providers: [HomeBenefitsService],
  exports: [HomeBenefitsService],
})
export class HomeBenefitsModule {}
