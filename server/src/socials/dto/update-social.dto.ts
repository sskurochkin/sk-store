import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSocialDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    { message: 'link must be an http or https URL' },
  )
  @MaxLength(2_000)
  link?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  icon?: string;
}
