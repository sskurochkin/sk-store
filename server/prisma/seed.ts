import { hash } from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const BOOTSTRAP_PASSWORD = 'admin123';

type AdminCredentials = {
  username: string;
  password: string;
};

function resolveAdminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME?.trim() || 'admin';
  const password = process.env.ADMIN_PASSWORD?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!password || password.length < 12) {
      throw new Error(
        'ADMIN_PASSWORD must be set (minimum 12 characters) for production seed',
      );
    }
    if (password === BOOTSTRAP_PASSWORD) {
      throw new Error(
        'Bootstrap password must not be used in production seed',
      );
    }
    return { username, password };
  }

  return {
    username,
    password: password || BOOTSTRAP_PASSWORD,
  };
}

const DEMO_PRODUCTS = [
  {
    alias: 'sourdough-loaf',
    name: 'Sourdough Loaf',
    description: 'Classic naturally leavened sourdough with a crisp crust.',
    mainPhoto: 'https://example.com/images/sourdough-loaf.jpg',
    gallery: [
      'https://example.com/images/sourdough-loaf-1.jpg',
      'https://example.com/images/sourdough-loaf-2.jpg',
    ],
    price: '12.50',
  },
  {
    alias: 'chocolate-croissant',
    name: 'Chocolate Croissant',
    description: 'Buttery laminated pastry filled with dark chocolate.',
    mainPhoto: 'https://example.com/images/chocolate-croissant.jpg',
    gallery: [],
    price: '4.75',
  },
] as const;

const DEMO_NEWS = [
  {
    alias: 'autumn-special',
    title: 'Autumn Special',
    description: 'Seasonal sourdough and spiced pastries are back.',
    mainPhoto: 'https://example.com/images/autumn-special.jpg',
    content:
      '<p>Our <strong>autumn menu</strong> is ready. Visit us this weekend.</p>',
    tags: ['осень', 'завтрак', 'выпечка'],
  },
  {
    alias: 'weekend-hours',
    title: 'Weekend Hours',
    description: 'Updated opening hours for Saturday and Sunday.',
    mainPhoto: 'https://example.com/images/weekend-hours.jpg',
    content:
      '<p>We open at <strong>9:00</strong> on weekends. See you soon!</p>',
    tags: ['часы работы'],
  },
  {
    alias: 'hot-dog-friday',
    title: 'Hot Dog Friday',
    description: 'House buns and mustard for the weekend crowd.',
    mainPhoto: 'https://example.com/images/hot-dog-friday.jpg',
    content:
      '<p>Try our <strong>hot dog</strong> on a soft bakery bun every Friday.</p>',
    tags: ['хот-дог', 'завтрак'],
  },
  {
    alias: 'pumpkin-loaf',
    title: 'Pumpkin Loaf',
    description: 'Spiced pumpkin loaf for cooler mornings.',
    mainPhoto: 'https://example.com/images/pumpkin-loaf.jpg',
    content:
      '<p>Warm <em>pumpkin</em> loaf with cinnamon — perfect for autumn breakfast.</p>',
    tags: ['осень', 'завтрак'],
  },
] as const;

/** Fixed IDs so social seed stays idempotent without a unique natural key. */
const DEMO_SOCIALS = [
  {
    id: 'seed_social_instagram',
    name: 'Instagram',
    link: 'https://instagram.com/skstore',
    icon: 'i-instagram',
  },
  {
    id: 'seed_social_telegram',
    name: 'Telegram',
    link: 'https://t.me/skstore',
    icon: 'i-mail',
  },
  {
    id: 'seed_social_vk',
    name: 'VK',
    link: 'https://vk.com/skstore',
    icon: 'i-vkontakte',
  },
] as const;

const SITE_SETTINGS_ID = 'default';

const DEMO_SITE_SETTINGS = {
  id: SITE_SETTINGS_ID,
  siteName: 'SK Store',
  tagline: 'Свежая выпечка к вашему столу',
  description: 'Свежая выпечка к вашему столу — каталог и заказ онлайн.',
  footerBlurb:
    'Пекарня и витрина заказов. Свежая выпечка и удобный заказ онлайн.',
  logoUrl: null as string | null,
  phone: '+375 (29) 123-45-67',
  email: 'info@skstore.example',
  address: 'г. Минск, ул. Примерная, 1',
  workingHours: 'Пн–Сб: 8:00–20:00, Вс: 9:00–18:00',
  mapEnabled: false,
  mapEmbedUrl: null as string | null,
  mapLinkUrl: null as string | null,
  legalOperatorName: null as string | null,
  legalContactEmail: 'privacy@skstore.example',
  seoMetaDescription:
    'Свежая выпечка к вашему столу — каталог и заказ онлайн.',
  seoKeywords:
    'пекарня, выпечка, хлеб, заказ онлайн, SK Store',
  seoRobotsIndex: true,
  seoRobotsFollow: true,
  seoOgTitle: null as string | null,
  seoOgDescription: null as string | null,
  seoOgImageUrl: null as string | null,
  googleAnalyticsId: null as string | null,
  yandexMetrikaId: null as string | null,
} as const;

const DEMO_HOME_BENEFITS = [
  {
    id: 'seed_benefit_fresh',
    title: 'Свежая выпечка',
    description:
      'Печём каждый день — к вашему столу без компромиссов по вкусу.',
    icon: 'i-calendar',
    sortOrder: 0,
  },
  {
    id: 'seed_benefit_quality',
    title: 'Качественные ингредиенты',
    description:
      'Отбираем муку, масло и начинки так, чтобы результат был стабильным.',
    icon: 'i-star',
    sortOrder: 1,
  },
  {
    id: 'seed_benefit_order',
    title: 'Удобный заказ',
    description:
      'Соберите корзину на сайте и оставьте заявку — мы подтвердим детали.',
    icon: 'i-cart',
    sortOrder: 2,
  },
  {
    id: 'seed_benefit_delivery',
    title: 'Самовывоз и доставка',
    description:
      'Заберите заказ у нас или договоритесь о доставке при оформлении.',
    icon: 'i-delivery',
    sortOrder: 3,
  },
] as const;

async function main(): Promise<void> {
  const { username: adminUsername, password: adminPassword } =
    resolveAdminCredentials();
  const passwordHash = await hash(adminPassword, BCRYPT_ROUNDS);

  await prisma.admin.upsert({
    where: { username: adminUsername },
    create: {
      username: adminUsername,
      passwordHash,
    },
    update: {
      passwordHash,
    },
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    await seedDemoCatalog();
  }

  await seedSiteContent();

  console.log(
    `Seed complete: admin user "${adminUsername}",` +
      (isProduction
        ? ' site content (no demo catalog in production).'
        : ` ${DEMO_PRODUCTS.length} products, ${DEMO_NEWS.length} news,` +
          ` ${DEMO_SOCIALS.length} socials, site settings, ${DEMO_HOME_BENEFITS.length} home benefits, legal pages.`),
  );
}

async function seedDemoCatalog(): Promise<void> {
  for (const product of DEMO_PRODUCTS) {
    await prisma.product.upsert({
      where: { alias: product.alias },
      create: {
        name: product.name,
        alias: product.alias,
        description: product.description,
        mainPhoto: product.mainPhoto,
        gallery: [...product.gallery],
        price: product.price,
      },
      update: {
        name: product.name,
        description: product.description,
        mainPhoto: product.mainPhoto,
        gallery: [...product.gallery],
        price: product.price,
      },
    });
  }

  for (const news of DEMO_NEWS) {
    await prisma.news.upsert({
      where: { alias: news.alias },
      create: {
        title: news.title,
        alias: news.alias,
        description: news.description,
        mainPhoto: news.mainPhoto,
        content: news.content,
        tags: [...news.tags],
      },
      update: {
        title: news.title,
        description: news.description,
        mainPhoto: news.mainPhoto,
        content: news.content,
        tags: [...news.tags],
      },
    });
  }

}

async function seedSiteContent(): Promise<void> {
  for (const social of DEMO_SOCIALS) {
    await prisma.social.upsert({
      where: { id: social.id },
      create: {
        id: social.id,
        name: social.name,
        link: social.link,
        icon: social.icon,
      },
      update: {
        name: social.name,
        link: social.link,
        icon: social.icon,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { ...DEMO_SITE_SETTINGS },
    update: {
      siteName: DEMO_SITE_SETTINGS.siteName,
      tagline: DEMO_SITE_SETTINGS.tagline,
      description: DEMO_SITE_SETTINGS.description,
      footerBlurb: DEMO_SITE_SETTINGS.footerBlurb,
      logoUrl: DEMO_SITE_SETTINGS.logoUrl,
      phone: DEMO_SITE_SETTINGS.phone,
      email: DEMO_SITE_SETTINGS.email,
      address: DEMO_SITE_SETTINGS.address,
      workingHours: DEMO_SITE_SETTINGS.workingHours,
      mapEnabled: DEMO_SITE_SETTINGS.mapEnabled,
      mapEmbedUrl: DEMO_SITE_SETTINGS.mapEmbedUrl,
      mapLinkUrl: DEMO_SITE_SETTINGS.mapLinkUrl,
      legalOperatorName: DEMO_SITE_SETTINGS.legalOperatorName,
      legalContactEmail: DEMO_SITE_SETTINGS.legalContactEmail,
      seoMetaDescription: DEMO_SITE_SETTINGS.seoMetaDescription,
      seoKeywords: DEMO_SITE_SETTINGS.seoKeywords,
      seoRobotsIndex: DEMO_SITE_SETTINGS.seoRobotsIndex,
      seoRobotsFollow: DEMO_SITE_SETTINGS.seoRobotsFollow,
      seoOgTitle: DEMO_SITE_SETTINGS.seoOgTitle,
      seoOgDescription: DEMO_SITE_SETTINGS.seoOgDescription,
      seoOgImageUrl: DEMO_SITE_SETTINGS.seoOgImageUrl,
      googleAnalyticsId: DEMO_SITE_SETTINGS.googleAnalyticsId,
      yandexMetrikaId: DEMO_SITE_SETTINGS.yandexMetrikaId,
    },
  });

  for (const benefit of DEMO_HOME_BENEFITS) {
    await prisma.homeBenefit.upsert({
      where: { id: benefit.id },
      create: {
        id: benefit.id,
        title: benefit.title,
        description: benefit.description,
        icon: benefit.icon,
        sortOrder: benefit.sortOrder,
      },
      update: {
        title: benefit.title,
        description: benefit.description,
        icon: benefit.icon,
        sortOrder: benefit.sortOrder,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SEED_LEGAL_PAGES } = require('../src/legal-pages/legal-pages.seed-data') as {
    SEED_LEGAL_PAGES: Array<{
      slug: string;
      title: string;
      sections: Prisma.InputJsonValue;
    }>;
  };

  for (const page of SEED_LEGAL_PAGES) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        sections: page.sections,
      },
      update: {
        title: page.title,
        sections: page.sections,
      },
    });
  }

}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
