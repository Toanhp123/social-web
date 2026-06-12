import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { FeedReason, PostVisibility } from '../src/generated/prisma/enums.js';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';

loadEnvFile();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: DATABASE_URL,
  }),
  log: ['error', 'warn'],
});

const POST_BATCH_SIZE = readPositiveInteger({
  envKey: 'BACKFILL_FEED_POST_BATCH_SIZE',
  flag: '--post-batch-size',
  fallback: 500,
});
const RECIPIENT_BATCH_SIZE = readPositiveInteger({
  envKey: 'BACKFILL_FEED_RECIPIENT_BATCH_SIZE',
  flag: '--recipient-batch-size',
  fallback: 2_000,
});

type BackfillPost = {
  id: string;
  authorId: string;
  visibility: PostVisibility;
};

async function main() {
  let cursor: { createdAt: Date; id: string } | null = null;
  let processedPosts = 0;
  let createdFeedItems = 0;

  await markExistingAuthorFeedItems();

  while (true) {
    const posts = await findPostPage(cursor);

    if (posts.length === 0) {
      break;
    }

    for (const post of posts) {
      createdFeedItems += await backfillPost(post);
    }

    processedPosts += posts.length;
    const lastPost = posts.at(-1);
    cursor = lastPost
      ? { createdAt: lastPost.createdAt, id: lastPost.id }
      : null;

    console.log(
      `Backfilled feed for ${processedPosts} posts, created ${createdFeedItems} feed items`,
    );
  }

  console.log(
    `Feed backfill complete: ${processedPosts} posts scanned, ${createdFeedItems} feed items created`,
  );
}

async function markExistingAuthorFeedItems() {
  await prisma.$executeRaw`
    UPDATE "Feed" AS feed
    SET "reason" = 'AUTHOR'::"FeedReason"
    FROM "Post" AS post
    WHERE feed."postId" = post."id"
      AND feed."userId" = post."authorId"
      AND feed."reason" IS NULL
  `;
}

async function findPostPage(cursor: { createdAt: Date; id: string } | null) {
  return prisma.post.findMany({
    where: {
      deletedAt: null,
      isHidden: false,
      ...(cursor
        ? {
            OR: [
              { createdAt: { gt: cursor.createdAt } },
              {
                createdAt: cursor.createdAt,
                id: { gt: cursor.id },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: POST_BATCH_SIZE,
    select: {
      id: true,
      authorId: true,
      visibility: true,
      createdAt: true,
    },
  });
}

async function backfillPost(post: BackfillPost): Promise<number> {
  let createdCount = 0;

  createdCount += await createFeedItems(post.id, [
    {
      userId: post.authorId,
      postId: post.id,
      reason: FeedReason.AUTHOR,
    },
  ]);

  if (post.visibility === PostVisibility.PRIVATE) {
    return createdCount;
  }

  createdCount += await backfillFriendRecipients(post);

  if (post.visibility === PostVisibility.PUBLIC) {
    createdCount += await backfillFollowerRecipients(post);
  }

  return createdCount;
}

async function backfillFriendRecipients(post: BackfillPost): Promise<number> {
  return (
    (await backfillFriendSide(post, {
      authorSide: 'user1Id',
      friendSide: 'user2Id',
    })) +
    (await backfillFriendSide(post, {
      authorSide: 'user2Id',
      friendSide: 'user1Id',
    }))
  );
}

async function backfillFriendSide(
  post: BackfillPost,
  input: {
    authorSide: 'user1Id' | 'user2Id';
    friendSide: 'user1Id' | 'user2Id';
  },
): Promise<number> {
  let createdCount = 0;
  let cursor: string | null = null;

  while (true) {
    const friendships = await prisma.friendship.findMany({
      where: {
        [input.authorSide]: post.authorId,
        ...(cursor ? { [input.friendSide]: { gt: cursor } } : {}),
      },
      orderBy: { [input.friendSide]: 'asc' },
      take: RECIPIENT_BATCH_SIZE,
      select: {
        [input.friendSide]: true,
      },
    });

    if (friendships.length === 0) {
      return createdCount;
    }

    const recipients = friendships.map(
      (friendship) => friendship[input.friendSide],
    );

    createdCount += await createFeedItems(
      post.id,
      recipients.map((userId) => ({
        userId,
        postId: post.id,
        reason: FeedReason.FRIEND_ACTIVITY,
      })),
    );

    cursor = recipients.at(-1) ?? cursor;

    if (friendships.length < RECIPIENT_BATCH_SIZE || !cursor) {
      return createdCount;
    }
  }
}

async function backfillFollowerRecipients(post: BackfillPost): Promise<number> {
  let createdCount = 0;
  let cursor: string | null = null;

  while (true) {
    const followers = await prisma.follow.findMany({
      where: {
        followingId: post.authorId,
        ...(cursor ? { followerId: { gt: cursor } } : {}),
      },
      orderBy: { followerId: 'asc' },
      take: RECIPIENT_BATCH_SIZE,
      select: {
        followerId: true,
      },
    });

    if (followers.length === 0) {
      return createdCount;
    }

    createdCount += await createFeedItems(
      post.id,
      followers.map((follow) => ({
        userId: follow.followerId,
        postId: post.id,
        reason: FeedReason.FOLLOWING,
      })),
    );

    cursor = followers.at(-1)?.followerId ?? cursor;

    if (followers.length < RECIPIENT_BATCH_SIZE || !cursor) {
      return createdCount;
    }
  }
}

async function createFeedItems(
  postId: string,
  items: Prisma.FeedCreateManyInput[],
): Promise<number> {
  if (items.length === 0) {
    return 0;
  }

  const result = await prisma.feed.createMany({
    data: items.map((item) => ({
      ...item,
      postId,
      score: item.score ?? 0,
    })),
    skipDuplicates: true,
  });

  return result.count;
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
