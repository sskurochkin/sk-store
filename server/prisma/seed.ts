import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const BCRYPT_ROUNDS = 10;

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
  },
  {
    alias: 'weekend-hours',
    title: 'Weekend Hours',
    description: 'Updated opening hours for Saturday and Sunday.',
    mainPhoto: 'https://example.com/images/weekend-hours.jpg',
    content:
      '<p>We open at <strong>9:00</strong> on weekends. See you soon!</p>',
  },
] as const;

/** Fixed IDs so social seed stays idempotent without a unique natural key. */
const DEMO_SOCIALS = [
  {
    id: 'seed_social_instagram',
    name: 'Instagram',
    link: 'https://instagram.com/skstore',
    icon: 'instagram',
  },
  {
    id: 'seed_social_telegram',
    name: 'Telegram',
    link: 'https://t.me/skstore',
    icon: 'telegram',
  },
  {
    id: 'seed_social_vk',
    name: 'VK',
    link: 'https://vk.com/skstore',
    icon: 'vk',
  },
] as const;

async function main(): Promise<void> {
  const passwordHash = await hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    create: {
      username: ADMIN_USERNAME,
      passwordHash,
    },
    update: {
      passwordHash,
    },
  });

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
      },
      update: {
        title: news.title,
        description: news.description,
        mainPhoto: news.mainPhoto,
        content: news.content,
      },
    });
  }

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

  console.log(
    `Seed complete: admin "${ADMIN_USERNAME}", ${DEMO_PRODUCTS.length} products, ${DEMO_NEWS.length} news, ${DEMO_SOCIALS.length} socials.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
