import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

const optionalUrlOptions = {
  protocols: ['http', 'https'],
  require_protocol: true,
  require_valid_protocol: true,
};

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  siteName?: string;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(300)
  tagline?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5_000)
  description?: string;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(2_000)
  footerBlurb?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsUrl(optionalUrlOptions, {
    message: 'logoUrl must be an http or https URL',
  })
  @MaxLength(2_000)
  logoUrl?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(100)
  phone?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(320)
  email?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(1_000)
  address?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(500)
  workingHours?: string | null;

  @IsOptional()
  @IsBoolean()
  mapEnabled?: boolean;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsUrl(optionalUrlOptions, {
    message: 'mapEmbedUrl must be an http or https URL',
  })
  @MaxLength(2_000)
  mapEmbedUrl?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsUrl(optionalUrlOptions, {
    message: 'mapLinkUrl must be an http or https URL',
  })
  @MaxLength(2_000)
  mapLinkUrl?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(500)
  legalOperatorName?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(320)
  legalContactEmail?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(5_000)
  seoMetaDescription?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(2_000)
  seoKeywords?: string | null;

  @IsOptional()
  @IsBoolean()
  seoRobotsIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  seoRobotsFollow?: boolean;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(300)
  seoOgTitle?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(5_000)
  seoOgDescription?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsUrl(optionalUrlOptions, {
    message: 'seoOgImageUrl must be an http or https URL',
  })
  @MaxLength(2_000)
  seoOgImageUrl?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(50)
  @Matches(/^(G-[A-Z0-9]+|UA-\d+-\d+)$/, {
    message:
      'googleAnalyticsId must be a GA4 (G-…) or Universal Analytics (UA-…) ID',
  })
  googleAnalyticsId?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: 'yandexMetrikaId must contain digits only',
  })
  yandexMetrikaId?: string | null;
}
