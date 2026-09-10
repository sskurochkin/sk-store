-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "seoMetaDescription" TEXT,
ADD COLUMN     "seoRobotsIndex" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seoRobotsFollow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seoOgTitle" TEXT,
ADD COLUMN     "seoOgDescription" TEXT,
ADD COLUMN     "seoOgImageUrl" TEXT,
ADD COLUMN     "googleAnalyticsId" TEXT,
ADD COLUMN     "yandexMetrikaId" TEXT;
