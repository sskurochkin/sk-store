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

  console.log(
    `Seed complete: admin user "${ADMIN_USERNAME}" and ${DEMO_PRODUCTS.length} demo products are ready.`,
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
