import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { PostType, PostVisibility } from '../src/generated/prisma/enums.js';
import { PrismaPg } from '@prisma/adapter-pg';

loadEnvFile();

type ReactionCounts = {
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
};

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

const TOTAL_POSTS = readPositiveInteger({
  envKey: 'SEED_POSTS',
  flag: '--posts',
  fallback: 1_000_000,
});
const BATCH_SIZE = readPositiveInteger({
  envKey: 'SEED_BATCH_SIZE',
  flag: '--batch-size',
  fallback: 5_000,
});
const AUTHOR_LIMIT = readOptionalPositiveInteger({
  envKey: 'SEED_POST_AUTHOR_LIMIT',
  flag: '--author-limit',
});
const START_DATE = readDate({
  envKey: 'SEED_POST_START_DATE',
  fallback: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
});
const END_DATE = readDate({
  envKey: 'SEED_POST_END_DATE',
  fallback: new Date(),
});

if (START_DATE.getTime() > END_DATE.getTime()) {
  throw new Error('SEED_POST_START_DATE must be before SEED_POST_END_DATE');
}

async function main() {
  const authors = await prisma.user.findMany({
    select: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    ...(AUTHOR_LIMIT ? { take: AUTHOR_LIMIT } : {}),
  });

  if (authors.length === 0) {
    throw new Error('No users found. Run the user seed before seeding posts.');
  }

  console.log(
    `Seeding ${TOTAL_POSTS} posts with ${authors.length} authors, batch size ${BATCH_SIZE}`,
  );

  for (let offset = 0; offset < TOTAL_POSTS; offset += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, TOTAL_POSTS - offset);
    const posts: Prisma.PostCreateManyInput[] = [];
    const stats: Prisma.PostStatsCreateManyInput[] = [];

    for (let i = 0; i < size; i++) {
      const index = offset + i;
      const id = `seed-post-${index}`;
      const createdAt = createPostDate(index);
      const reactionCounts = createReactionCounts(index);

      posts.push({
        id,
        authorId: authors[index % authors.length].id,
        content: createContent(index),
        type: PostType.TEXT,
        visibility: createVisibility(index),
        createdAt,
        updatedAt: createdAt,
      });

      stats.push({
        postId: id,
        ...reactionCounts,
        commentCount: createCount(index, 3, 25),
        shareCount: createCount(index, 5, 12),
        totalReactionCount:
          reactionCounts.likeCount +
          reactionCounts.loveCount +
          reactionCounts.hahaCount +
          reactionCounts.wowCount +
          reactionCounts.sadCount +
          reactionCounts.angryCount,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.createMany({
        data: posts,
        skipDuplicates: true,
      });
      await tx.postStats.createMany({
        data: stats,
        skipDuplicates: true,
      });
    });

    console.log(`Seeded posts ${offset + size}/${TOTAL_POSTS}`);
  }
}

function createContent(index: number): string {
  const topics = [
    'daily update',
    'team moment',
    'weekend plan',
    'product thought',
    'learning note',
    'community story',
    'coffee break',
    'travel memory',
    'work reflection',
    'small win',
  ];
  const bodies = [
    'Sharing a quick note from today and keeping the conversation going.',
    'This made the day feel a little more connected than usual.',
    'A simple thought, but it stayed with me longer than expected.',
    'Trying something new and curious what everyone thinks.',
    'One more tiny progress update before the day wraps up.',
    'The kind of moment that makes the timeline feel alive.',
  ];

  return `Seed post #${index + 1} - ${pick(topics, index, 7)}. ${pick(
    bodies,
    index,
    19,
  )}`;
}

function createPostDate(index: number): Date {
  const startTime = START_DATE.getTime();
  const endTime = END_DATE.getTime();
  const range = Math.max(endTime - startTime, 1);
  const offset = (index * 9_973) % range;

  return new Date(startTime + offset);
}

function createVisibility(index: number): PostVisibility {
  if (index % 31 === 0) {
    return PostVisibility.PRIVATE;
  }

  if (index % 7 === 0) {
    return PostVisibility.FRIENDS_ONLY;
  }

  return PostVisibility.PUBLIC;
}

function createReactionCounts(index: number): ReactionCounts {
  return {
    likeCount: createCount(index, 2, 120),
    loveCount: createCount(index, 11, 36),
    hahaCount: createCount(index, 17, 28),
    wowCount: createCount(index, 23, 18),
    sadCount: createCount(index, 29, 8),
    angryCount: createCount(index, 37, 6),
  };
}

function createCount(index: number, salt: number, max: number): number {
  if ((index + salt) % 13 === 0) {
    return 0;
  }

  return ((index + 1) * salt * 17) % max;
}

function pick<T>(values: T[], index: number, salt: number): T {
  return values[(index * 31 + salt) % values.length];
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

function readOptionalPositiveInteger(options: {
  envKey: string;
  flag: string;
}): number | undefined {
  const value = readCliOption(options.flag) ?? process.env[options.envKey];

  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${options.envKey} must be a positive integer`);
  }

  return parsedValue;
}

function readDate(options: { envKey: string; fallback: Date }): Date {
  const value = process.env[options.envKey];

  if (value === undefined || value.trim() === '') {
    return options.fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${options.envKey} must be a valid date`);
  }

  return date;
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
