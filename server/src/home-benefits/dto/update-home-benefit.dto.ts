import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateHomeBenefitDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2_000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder?: number;
}
