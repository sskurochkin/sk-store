import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, type SiteSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_ID } from './settings.defaults';
import type { UpdateSettingsDto } from './dto/update-settings.dto';
import type { SiteSettingsResponse } from './types/settings-response.type';

type OptionalStringField =
  | 'tagline'
  | 'footerBlurb'
  | 'logoUrl'
  | 'phone'
  | 'address'
  | 'workingHours'
  | 'mapEmbedUrl'
  | 'mapLinkUrl'
  | 'legalOperatorName'
  | 'seoMetaDescription'
  | 'seoKeywords'
  | 'seoOgTitle'
  | 'seoOgDescription'
  | 'seoOgImageUrl'
  | 'googleAnalyticsId'
  | 'yandexMetrikaId';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(): Promise<SiteSettingsResponse> {
    const item = await this.ensureSettingsRow();
    return this.toResponse(item);
  }

  async update(dto: UpdateSettingsDto): Promise<SiteSettingsResponse> {
    await this.ensureSettingsRow();

    const data: Prisma.SiteSettingsUpdateInput = {};

    if (dto.siteName !== undefined) {
      data.siteName = dto.siteName.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.mapEnabled !== undefined) {
      data.mapEnabled = dto.mapEnabled;
    }
    if (dto.seoRobotsIndex !== undefined) {
      data.seoRobotsIndex = dto.seoRobotsIndex;
    }
    if (dto.seoRobotsFollow !== undefined) {
      data.seoRobotsFollow = dto.seoRobotsFollow;
    }

    this.assignOptionalString(data, 'tagline', dto.tagline);
    this.assignOptionalString(data, 'footerBlurb', dto.footerBlurb);
    this.assignOptionalString(data, 'logoUrl', dto.logoUrl);
    this.assignOptionalString(data, 'phone', dto.phone);
    this.assignOptionalEmail(data, 'email', dto.email);
    this.assignOptionalString(data, 'address', dto.address);
    this.assignOptionalString(data, 'workingHours', dto.workingHours);
    this.assignOptionalString(data, 'mapEmbedUrl', dto.mapEmbedUrl);
    this.assignOptionalString(data, 'mapLinkUrl', dto.mapLinkUrl);
    this.assignOptionalString(data, 'legalOperatorName', dto.legalOperatorName);
    this.assignOptionalEmail(data, 'legalContactEmail', dto.legalContactEmail);
    this.assignOptionalString(
      data,
      'seoMetaDescription',
      dto.seoMetaDescription,
    );
    this.assignOptionalString(data, 'seoKeywords', dto.seoKeywords);
    this.assignOptionalString(data, 'seoOgTitle', dto.seoOgTitle);
    this.assignOptionalString(data, 'seoOgDescription', dto.seoOgDescription);
    this.assignOptionalString(data, 'seoOgImageUrl', dto.seoOgImageUrl);
    this.assignOptionalString(data, 'googleAnalyticsId', dto.googleAnalyticsId);
    this.assignOptionalString(data, 'yandexMetrikaId', dto.yandexMetrikaId);

    const item = await this.prisma.siteSettings.update({
      where: { id: SITE_SETTINGS_ID },
      data,
    });

    return this.toResponse(item);
  }

  private async ensureSettingsRow(): Promise<SiteSettings> {
    const existing = await this.prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.siteSettings.create({
      data: {
        id: SITE_SETTINGS_ID,
        siteName: DEFAULT_SITE_SETTINGS.siteName,
        tagline: DEFAULT_SITE_SETTINGS.tagline,
        description: DEFAULT_SITE_SETTINGS.description,
        footerBlurb: DEFAULT_SITE_SETTINGS.footerBlurb,
        logoUrl: DEFAULT_SITE_SETTINGS.logoUrl,
        phone: DEFAULT_SITE_SETTINGS.phone,
        email: DEFAULT_SITE_SETTINGS.email,
        address: DEFAULT_SITE_SETTINGS.address,
        workingHours: DEFAULT_SITE_SETTINGS.workingHours,
        mapEnabled: DEFAULT_SITE_SETTINGS.mapEnabled,
        mapEmbedUrl: DEFAULT_SITE_SETTINGS.mapEmbedUrl,
        mapLinkUrl: DEFAULT_SITE_SETTINGS.mapLinkUrl,
        legalOperatorName: DEFAULT_SITE_SETTINGS.legalOperatorName,
        legalContactEmail: DEFAULT_SITE_SETTINGS.legalContactEmail,
        seoMetaDescription: DEFAULT_SITE_SETTINGS.seoMetaDescription,
        seoKeywords: DEFAULT_SITE_SETTINGS.seoKeywords,
        seoRobotsIndex: DEFAULT_SITE_SETTINGS.seoRobotsIndex,
        seoRobotsFollow: DEFAULT_SITE_SETTINGS.seoRobotsFollow,
        seoOgTitle: DEFAULT_SITE_SETTINGS.seoOgTitle,
        seoOgDescription: DEFAULT_SITE_SETTINGS.seoOgDescription,
        seoOgImageUrl: DEFAULT_SITE_SETTINGS.seoOgImageUrl,
        googleAnalyticsId: DEFAULT_SITE_SETTINGS.googleAnalyticsId,
        yandexMetrikaId: DEFAULT_SITE_SETTINGS.yandexMetrikaId,
      },
    });
  }

  private assignOptionalString(
    data: Prisma.SiteSettingsUpdateInput,
    field: OptionalStringField,
    value: string | null | undefined,
  ): void {
    const normalized = this.normalizeOptionalString(value);
    if (normalized !== undefined) {
      data[field] = normalized;
    }
  }

  private assignOptionalEmail(
    data: Prisma.SiteSettingsUpdateInput,
    field: 'email' | 'legalContactEmail',
    value: string | null | undefined,
  ): void {
    const normalized = this.normalizeOptionalString(value);
    if (normalized === undefined) {
      return;
    }
    if (normalized !== null && !this.isValidEmail(normalized)) {
      throw new BadRequestException(`${field} must be a valid email address`);
    }
    data[field] = normalized;
  }

  private normalizeOptionalString(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private toResponse(item: SiteSettings): SiteSettingsResponse {
    return {
      id: item.id,
      siteName: item.siteName,
      tagline: item.tagline,
      description: item.description,
      footerBlurb: item.footerBlurb,
      logoUrl: item.logoUrl,
      phone: item.phone,
      email: item.email,
      address: item.address,
      workingHours: item.workingHours,
      mapEnabled: item.mapEnabled,
      mapEmbedUrl: item.mapEmbedUrl,
      mapLinkUrl: item.mapLinkUrl,
      legalOperatorName: item.legalOperatorName,
      legalContactEmail: item.legalContactEmail,
      seoMetaDescription: item.seoMetaDescription,
      seoKeywords: item.seoKeywords,
      seoRobotsIndex: item.seoRobotsIndex,
      seoRobotsFollow: item.seoRobotsFollow,
      seoOgTitle: item.seoOgTitle,
      seoOgDescription: item.seoOgDescription,
      seoOgImageUrl: item.seoOgImageUrl,
      googleAnalyticsId: item.googleAnalyticsId,
      yandexMetrikaId: item.yandexMetrikaId,
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
