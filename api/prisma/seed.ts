import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { UserRole } from '../src/generated/prisma/enums.js';

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the seed script');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123';
  const fullName = process.env.SEED_ADMIN_FULL_NAME ?? 'Admin User';
  const username = process.env.SEED_ADMIN_USERNAME ?? 'adminuser';
  const passwordHash = await bcrypt.hash(password, 10);

  const account = await prisma.authAccount.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      disabledAt: null,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.user.upsert({
    where: { id: account.id },
    update: {
      fullName,
      username: username || null,
    },
    create: {
      id: account.id,
      fullName,
      username: username || null,
    },
  });

  console.log(`Seeded admin account: ${account.email}`);
}

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return;
  }

  for (const rawLine of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = normalizeEnvValue(line.slice(separatorIndex + 1));
  }
}

function normalizeEnvValue(value: string): string {
  const trimmedValue = value.trim();
  const quote = trimmedValue[0];

  if (
    (quote === '"' || quote === "'") &&
    trimmedValue[trimmedValue.length - 1] === quote
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
