import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NEWS_ALIAS_PATTERN } from './create-news.dto';

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(NEWS_ALIAS_PATTERN, {
    message:
      'alias must be a lowercase slug (letters, digits, hyphens), e.g. autumn-special',
  })
  alias?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2_000)
  mainPhoto?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(40, { each: true })
  tags?: string[];
}
