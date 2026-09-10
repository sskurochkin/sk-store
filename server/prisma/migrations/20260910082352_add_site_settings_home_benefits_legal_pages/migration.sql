-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "footerBlurb" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "workingHours" TEXT,
    "mapEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mapEmbedUrl" TEXT,
    "mapLinkUrl" TEXT,
    "legalOperatorName" TEXT,
    "legalContactEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeBenefit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPage" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
