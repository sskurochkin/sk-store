import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHomeBenefitDto } from './dto/create-home-benefit.dto';
import { UpdateHomeBenefitDto } from './dto/update-home-benefit.dto';
import { HomeBenefitsService } from './home-benefits.service';

@Controller('home-benefits')
export class HomeBenefitsController {
  constructor(private readonly homeBenefitsService: HomeBenefitsService) {}

  @Get()
  findAll() {
    return this.homeBenefitsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHomeBenefitDto) {
    return this.homeBenefitsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateHomeBenefitDto) {
    return this.homeBenefitsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.homeBenefitsService.remove(id);
  }
}
