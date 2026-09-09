import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateContactRequestDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @Transform(trimString)
  @IsString()
  @Matches(/^\+375\d{9}$/, {
    message: 'phone must be a Belarus number in +375XXXXXXXXX format',
  })
  phone!: string;

  @Transform(trimString)
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;

  @IsBoolean()
  @Equals(true, {
    message: 'consent must be true',
  })
  consent!: boolean;
}
