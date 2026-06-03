import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { UserRole } from '../src/generated/prisma/enums.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

loadEnvFile();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

const TOTAL_USERS = readPositiveInteger({
  envKey: 'SEED_USERS',
  flag: '--users',
  fallback: 1_000,
});
const BATCH_SIZE = readPositiveInteger({
  envKey: 'SEED_BATCH_SIZE',
  flag: '--batch-size',
  fallback: 1_000,
});
const PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (let offset = 0; offset < TOTAL_USERS; offset += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, TOTAL_USERS - offset);

    const accounts: Prisma.AuthAccountCreateManyInput[] = [];
    const users: Prisma.UserCreateManyInput[] = [];

    for (let i = 0; i < size; i++) {
      const index = offset + i;
      const id = `seed-user-${index}`;

      accounts.push({
        id,
        email: `user${index}@example.com`,
        passwordHash,
        role: UserRole.USER,
      });

      users.push({
        id,
        username: `user${index}`,
        fullName: `User ${index}`,
        avatarUrl: null,
      });
    }

    await prisma.$transaction([
      prisma.authAccount.createMany({
        data: accounts,
        skipDuplicates: true,
      }),
      prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      }),
    ]);

    console.log(`Seeded ${offset + size}/${TOTAL_USERS}`);
  }
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
    trimmedValue.endsWith(quote) &&
    trimmedValue.length >= 2
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

function readPositiveInteger(options: {
  envKey: string;
  flag: string;
  fallback: number;
}): number {
  const value = readCliOption(options.flag) ?? process.env[options.envKey];

  if (value === undefined || value.trim() === '') {
    return options.fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${options.envKey} must be a positive integer`);
  }

  return parsedValue;
}

function readCliOption(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const argumentIndex = process.argv.indexOf(flag);

  if (argumentIndex !== -1) {
    return process.argv[argumentIndex + 1];
  }

  return process.argv
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
