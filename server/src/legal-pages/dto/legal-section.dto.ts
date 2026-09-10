import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class LegalSectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(5_000, { each: true })
  paragraphs!: string[];
}

export class LegalSectionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LegalSectionDto)
  sections!: LegalSectionDto[];
}
