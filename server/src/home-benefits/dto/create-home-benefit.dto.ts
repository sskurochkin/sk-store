import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateHomeBenefitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2_000)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  icon!: string;

  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder!: number;
}
