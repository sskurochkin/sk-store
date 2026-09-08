import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Lowercase kebab-case slug: `sourdough-loaf`, `rye-bread`. */
export const PRODUCT_ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(PRODUCT_ALIAS_PATTERN, {
    message:
      'alias must be a lowercase slug (letters, digits, hyphens), e.g. sourdough-loaf',
  })
  alias!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2_000)
  mainPhoto!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(2_000, { each: true })
  gallery?: string[];

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'price must be greater than 0' })
  price!: number;
}
