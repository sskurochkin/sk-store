import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Same lowercase kebab-case slug as products. */
export const NEWS_ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateNewsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(NEWS_ALIAS_PATTERN, {
    message:
      'alias must be a lowercase slug (letters, digits, hyphens), e.g. autumn-special',
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

  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(40, { each: true })
  tags?: string[];
}
