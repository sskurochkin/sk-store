import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Controller('contact-requests')
export class ContactRequestsController {
  constructor(
    private readonly contactRequestsService: ContactRequestsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  create(@Body() dto: CreateContactRequestDto) {
    return this.contactRequestsService.create(dto);
  }
}
