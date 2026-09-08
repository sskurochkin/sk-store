import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const BCRYPT_ROUNDS = 10;

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

  console.log(`Seed complete: admin user "${ADMIN_USERNAME}" is ready.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
