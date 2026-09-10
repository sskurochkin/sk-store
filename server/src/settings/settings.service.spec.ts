import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_ID } from './settings.defaults';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    siteSettings: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const sampleSettings = {
    id: SITE_SETTINGS_ID,
    siteName: DEFAULT_SITE_SETTINGS.siteName,
    tagline: null,
    description: DEFAULT_SITE_SETTINGS.description,
    footerBlurb: DEFAULT_SITE_SETTINGS.footerBlurb,
    logoUrl: 'https://example.com/logo.png',
    phone: '+375 29 123-45-67',
    email: 'info@skstore.example',
    address: 'Минск',
    workingHours: 'Пн–Пт: 9:00–18:00',
    mapEnabled: true,
    mapEmbedUrl: 'https://example.com/map-embed',
    mapLinkUrl: 'https://example.com/map-link',
    legalOperatorName: 'SK Store',
    legalContactEmail: 'legal@skstore.example',
    seoMetaDescription: 'Meta description',
    seoKeywords: 'bakery, bread',
    seoRobotsIndex: true,
    seoRobotsFollow: true,
    seoOgTitle: null,
    seoOgDescription: null,
    seoOgImageUrl: 'https://example.com/og.jpg',
    googleAnalyticsId: 'G-TEST123',
    yandexMetrikaId: '12345678',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      siteSettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SettingsService);
    jest.clearAllMocks();
  });

  it('findPublic creates defaults when row is missing', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(null);
    prisma.siteSettings.create.mockResolvedValue({
      ...sampleSettings,
      phone: null,
      email: null,
      address: null,
      workingHours: null,
      mapEnabled: false,
      mapEmbedUrl: null,
      mapLinkUrl: null,
      legalOperatorName: null,
      legalContactEmail: null,
    });

    const result = await service.findPublic();

    expect(prisma.siteSettings.create).toHaveBeenCalledTimes(1);
    expect(result.siteName).toBe(DEFAULT_SITE_SETTINGS.siteName);
    expect(result.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('findPublic returns existing row', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(sampleSettings);

    const result = await service.findPublic();

    expect(prisma.siteSettings.create).not.toHaveBeenCalled();
    expect(result.phone).toBe('+375 29 123-45-67');
  });

  it('update trims optional strings and clears empty tagline', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(sampleSettings);
    prisma.siteSettings.update.mockResolvedValue({
      ...sampleSettings,
      tagline: null,
      phone: '+375 29 000-00-00',
    });

    await service.update({
      tagline: '   ',
      phone: ' +375 29 000-00-00 ',
    });

    expect(prisma.siteSettings.update).toHaveBeenCalledWith({
      where: { id: SITE_SETTINGS_ID },
      data: {
        tagline: null,
        phone: '+375 29 000-00-00',
      },
    });
  });

  it('update clears optional fields when null is sent', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(sampleSettings);
    prisma.siteSettings.update.mockResolvedValue({
      ...sampleSettings,
      mapLinkUrl: null,
    });

    await service.update({
      mapLinkUrl: null,
    });

    expect(prisma.siteSettings.update).toHaveBeenCalledWith({
      where: { id: SITE_SETTINGS_ID },
      data: {
        mapLinkUrl: null,
      },
    });
  });

  it('update saves map embed URL together with cleared link URL', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(sampleSettings);
    prisma.siteSettings.update.mockResolvedValue({
      ...sampleSettings,
      mapEnabled: true,
      mapEmbedUrl: 'https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=178906170146',
      mapLinkUrl: null,
    });

    await service.update({
      mapEnabled: true,
      mapEmbedUrl:
        'https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=178906170146',
      mapLinkUrl: null,
    });

    expect(prisma.siteSettings.update).toHaveBeenCalledWith({
      where: { id: SITE_SETTINGS_ID },
      data: {
        mapEnabled: true,
        mapEmbedUrl:
          'https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=178906170146',
        mapLinkUrl: null,
      },
    });
  });
});
