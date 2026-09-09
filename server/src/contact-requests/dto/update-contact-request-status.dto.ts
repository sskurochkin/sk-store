import { IsEnum } from 'class-validator';
import { ContactRequestStatus } from '@prisma/client';

export class UpdateContactRequestStatusDto {
  @IsEnum(ContactRequestStatus, {
    message: `status must be one of: ${Object.values(ContactRequestStatus).join(', ')}`,
  })
  status!: ContactRequestStatus;
}
