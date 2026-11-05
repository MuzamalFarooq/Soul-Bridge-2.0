import { Redis } from "@upstash/redis";

/**
 * SoulBridge Redis Client & Cache Manager
 *
 * Provides a resilient, high-performance distributed caching layer using Upstash Redis.
 * Supports graceful degradation: If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are not configured, all operations safely bypass without breaking the application.
 */

let redisInstance = null;
let isConfigured = false;
let warningLogged = false;

function initRedis() {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      redisInstance = new Redis({
        url,
        token,
      });
      isConfigured = true;
    } catch (err) {
      console.error("[Redis] Initialization error:", err.message);
      redisInstance = null;
      isConfigured = false;
    }
  } else if (!warningLogged) {
    // Only warn once in server logs to avoid log spam
    console.warn(
      "[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not provided. Redis cache running in bypass mode."
    );
    warningLogged = true;
  }

  return redisInstance;
}

export function isRedisAvailable() {
  const client = initRedis();
  return Boolean(client && isConfigured);
}

// TTL presets in seconds
export const REDIS_TTL = {
  SEARCH: 300, // 5 minutes
  PUBLIC_PROFILE: 3600, // 1 hour
  NEW_PROFILES: 600, // 10 minutes
  COMMENTS: 300, // 5 minutes
  ADMIN_STATS: 60, // 1 minute
};

// Cache key generators
export const REDIS_KEYS = {
  publicProfile: (identifier) =>
    `soulbridge:profile:${String(identifier).toLowerCase().trim()}`,
  search: (query) => `soulbridge:search:${String(query).toLowerCase().trim()}`,
  newlyAddedProfiles: () => "soulbridge:profiles:newly-added",
  postComments: (targetId) => `soulbridge:comments:${String(targetId)}`,
  adminStats: () => "soulbridge:admin:stats",
};

/**
 * Get value from Redis cache
 */
export async function redisGet(key) {
  const client = initRedis();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ?? null;
  } catch (error) {
    console.error(`[Redis] Error getting key "${key}":`, error.message);
    return null;
  }
}

/**
 * Set value in Redis cache with TTL in seconds
 */
export async function redisSet(key, value, ttlSeconds = 300) {
  const client = initRedis();
  if (!client) return false;

  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, { ex: ttlSeconds });
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`[Redis] Error setting key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete one or more keys from Redis
 */
export async function redisDel(...keys) {
  const client = initRedis();
  if (!client || keys.length === 0) return 0;

  try {
    const validKeys = keys.filter(Boolean);
    if (validKeys.length === 0) return 0;
    return await client.del(...validKeys);
  } catch (error) {
    console.error(`[Redis] Error deleting keys:`, error.message);
    return 0;
  }
}

/**
 * Reusable Cache-Aside wrapper:
 * 1. Checks Redis cache first.
 * 2. On miss, invokes fetcherFn().
 * 3. Saves result in Redis with ttlSeconds.
 * 4. Returns data.
 */
export async function cacheWrap(key, ttlSeconds, fetcherFn) {
  // Try reading from Redis
  const cached = await redisGet(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  // Cache miss: execute fetcher
  const freshData = await fetcherFn();

  // Store in Redis in background if freshData exists
  if (freshData !== null && freshData !== undefined) {
    redisSet(key, freshData, ttlSeconds).catch((err) => {
      console.error(`[Redis] Background write error for "${key}":`, err.message);
    });
  }

  return freshData;
}

/**
 * Invalidation helpers
 */
export async function invalidateProfileCache(userId, username) {
  const keys = [];
  if (userId) keys.push(REDIS_KEYS.publicProfile(userId));
  if (username) keys.push(REDIS_KEYS.publicProfile(username));
  keys.push(REDIS_KEYS.newlyAddedProfiles());
  await redisDel(...keys);
}

export async function invalidatePostCommentsCache(targetId) {
  if (!targetId) return;
  await redisDel(REDIS_KEYS.postComments(targetId));
}

export async function invalidateAdminStatsCache() {
  await redisDel(REDIS_KEYS.adminStats());
}

