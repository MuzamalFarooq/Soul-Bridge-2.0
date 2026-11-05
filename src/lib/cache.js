import { revalidateTag, updateTag } from "next/cache";
import { prisma } from "./prisma";
import {
  redisGet,
  redisSet,
  REDIS_KEYS,
  REDIS_TTL,
  invalidateProfileCache,
  invalidatePostCommentsCache,
  invalidateAdminStatsCache,
} from "./redis";

/**
 * SoulBridge Multi-Layer Caching Architecture
 *
 * Layer 1: Next.js Cache Components & Invalidation (cacheTag, updateTag, revalidateTag)
 * Layer 2: Upstash Redis Distributed Cache (cross-instance serverless caching on Vercel)
 * Layer 3: Optimized Prisma MongoDB Queries (with indexed lookups and minimal projections)
 */

export const CACHE_TAGS = {
  PROFILES: "profiles",
  profile: (identifier) => `profile-${String(identifier).toLowerCase().trim()}`,
  SEARCH: "search",
  NEW_PROFILES: "new-profiles",
  comments: (targetId) => `comments-${String(targetId)}`,
  ADMIN_STATS: "admin-stats",
};

/**
 * Safe tag updater: attempts updateTag (for Server Actions)
 * and falls back to revalidateTag (for Route Handlers/SSR).
 */
export function safeInvalidateTag(tag) {
  if (!tag) return;
  try {
    updateTag(tag);
  } catch {
    try {
      revalidateTag(tag, "max");
    } catch {
      // Ignore if called outside request/action context
    }
  }
}

/**
 * CACHED: Get Public Profile by userId or username
 * Multi-layer: Checks Upstash Redis -> fallback to Prisma MongoDB -> stores in Redis.
 */
export async function getCachedPublicProfile(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim();
  const cacheKey = REDIS_KEYS.publicProfile(cleanId);

  // 1. Try Upstash Redis
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query MongoDB
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
  const whereClause = isObjectId
    ? { OR: [{ userId: cleanId }, { username: cleanId.toLowerCase() }] }
    : { username: cleanId.toLowerCase() };

  const profile = await prisma.profile.findFirst({
    where: whereClause,
    include: {
      user: {
        include: {
          photos: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!profile) return null;

  // 3. Populate Redis Cache (1 hour TTL)
  await redisSet(cacheKey, profile, REDIS_TTL.PUBLIC_PROFILE);

  // If queried by userId, also cache by username (and vice versa) for faster cross-lookup
  if (profile.username && cleanId !== profile.username.toLowerCase()) {
    const aliasKey = REDIS_KEYS.publicProfile(profile.username);
    await redisSet(aliasKey, profile, REDIS_TTL.PUBLIC_PROFILE);
  }
  if (profile.userId && cleanId !== profile.userId) {
    const userKey = REDIS_KEYS.publicProfile(profile.userId);
    await redisSet(userKey, profile, REDIS_TTL.PUBLIC_PROFILE);
  }

  return profile;
}

/**
 * CACHED: Search Users by Query
 * Multi-layer: Upstash Redis (5 min) -> Prisma MongoDB
 */
export async function getCachedUserSearch(query) {
  if (!query || typeof query !== "string") return [];
  const cleanQuery = query.trim();
  if (cleanQuery.length === 0) return [];

  const cacheKey = REDIS_KEYS.search(cleanQuery);

  // 1. Check Redis
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query MongoDB
  const results = await prisma.profile.findMany({
    where: {
      completed: true,
      OR: [
        { fullName: { contains: cleanQuery, mode: "insensitive" } },
        { username: { contains: cleanQuery, mode: "insensitive" } },
        { city: { contains: cleanQuery, mode: "insensitive" } },
        { profession: { contains: cleanQuery, mode: "insensitive" } },
      ],
    },
    take: 10,
    include: {
      user: {
        include: {
          photos: true,
        },
      },
    },
  });

  // 3. Cache in Redis (5 min TTL)
  await redisSet(cacheKey, results, REDIS_TTL.SEARCH);

  return results;
}

/**
 * CACHED: Newly Added Completed Profiles
 * Multi-layer: Upstash Redis (10 min) -> Prisma MongoDB
 */
export async function getCachedNewlyAddedProfiles() {
  const cacheKey = REDIS_KEYS.newlyAddedProfiles();

  // 1. Check Redis
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query MongoDB
  const profiles = await prisma.profile.findMany({
    where: { completed: true },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          photos: true,
        },
      },
    },
  });

  // 3. Cache in Redis (10 min TTL)
  await redisSet(cacheKey, profiles, REDIS_TTL.NEW_PROFILES);

  return profiles;
}

/**
 * CACHED: Post Comments
 * Multi-layer: Upstash Redis (5 min) -> Prisma MongoDB
 */
export async function getCachedPostComments(targetId) {
  if (!targetId) return [];
  const cleanTargetId = String(targetId);
  const cacheKey = REDIS_KEYS.postComments(cleanTargetId);

  // 1. Check Redis
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query MongoDB
  const comments = await prisma.comment.findMany({
    where: { targetId: cleanTargetId },
    orderBy: { createdAt: "desc" },
  });

  // 3. Cache in Redis (5 min TTL)
  if (comments && comments.length > 0) {
    await redisSet(cacheKey, comments, REDIS_TTL.COMMENTS);
  }

  return comments;
}

/**
 * CACHED: Admin Statistics
 * Multi-layer: Upstash Redis (1 min) -> Prisma MongoDB aggregate counts
 */
export async function getCachedAdminStats() {
  const cacheKey = REDIS_KEYS.adminStats();

  // 1. Check Redis
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query MongoDB
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    totalMatches,
    totalMessages,
    totalLikes,
    premiumUsers,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.match.count(),
    prisma.message.count(),
    prisma.like.count({ where: { type: "LIKE" } }),
    prisma.profile.count({ where: { premiumStatus: { not: "FREE" } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: { createdAt: true },
    }),
  ]);

  const stats = {
    totalUsers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    totalMatches,
    totalMessages,
    totalLikes,
    premiumUsers,
    recentSignups,
  };

  // 3. Cache in Redis (1 min TTL)
  await redisSet(cacheKey, stats, REDIS_TTL.ADMIN_STATS);

  return stats;
}

/**
 * INVALDATION: Invalidate User Profile across Redis and Next.js tags
 */
export async function invalidateUserProfile(userId, username) {
  // Invalidate in Redis
  await invalidateProfileCache(userId, username);

  // Invalidate Next.js cache tags
  if (userId) safeInvalidateTag(CACHE_TAGS.profile(userId));
  if (username) safeInvalidateTag(CACHE_TAGS.profile(username));
  safeInvalidateTag(CACHE_TAGS.PROFILES);
  safeInvalidateTag(CACHE_TAGS.NEW_PROFILES);
  safeInvalidateTag(CACHE_TAGS.SEARCH);
}

/**
 * INVALIDATION: Invalidate Post Comments
 */
export async function invalidatePostComments(targetId) {
  await invalidatePostCommentsCache(targetId);
  safeInvalidateTag(CACHE_TAGS.comments(targetId));
}

/**
 * INVALIDATION: Invalidate Admin Stats
 */
export async function invalidateAdminStats() {
  await invalidateAdminStatsCache();
  safeInvalidateTag(CACHE_TAGS.ADMIN_STATS);
}

