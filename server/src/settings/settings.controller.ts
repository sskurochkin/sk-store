import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findPublic() {
    return this.settingsService.findPublic();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
