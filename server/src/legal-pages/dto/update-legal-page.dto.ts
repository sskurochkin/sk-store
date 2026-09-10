import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LegalSectionDto } from './legal-section.dto';

export class UpdateLegalPageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegalSectionDto)
  sections?: LegalSectionDto[];
}
