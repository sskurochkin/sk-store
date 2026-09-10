import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPagesService } from './legal-pages.service';

@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.legalPagesService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() dto: UpdateLegalPageDto) {
    return this.legalPagesService.update(slug, dto);
  }
}
