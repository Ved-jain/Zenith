const Redis = require("ioredis");

// Create a Redis client instance.
// Using default configuration (localhost:6379) but could be extended via env vars.
const redisOptions = {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn(
        "[Redis] Connection retry limit reached. Redis fallback is active."
      );
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000);
  },
};

const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      ...redisOptions,
    });

redisClient.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redisClient.on("connect", () => {
  console.log("[Redis] Connected successfully.");
});

/**
 * Express middleware for Redis caching.
 * @param {function|string} keyGenerator - String or function returning the cache key based on req.
 * @param {number} ttlSeconds - Time to live in seconds.
 */
const cacheMiddleware = (keyGenerator, ttlSeconds) => async (req, res, next) => {
  const key =
    typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;
  const startTime = Date.now();

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      const latency = Date.now() - startTime;
      console.log(`[Cache HIT] ${key} - ${latency}ms`);
      res.setHeader("X-Cache-Status", "HIT");
      return res.json(JSON.parse(cachedData));
    }
  } catch (err) {
    console.error(`[Redis Error] GET ${key}:`, err.message);
    // Fallback: Continue without cache
  }

  // Intercept res.json to cache the outgoing response
  const originalJson = res.json;
  res.json = function (body) {
    res.setHeader("X-Cache-Status", "MISS");
    const latency = Date.now() - startTime;
    console.log(`[Cache MISS] ${key} - ${latency}ms (Fetched from MongoDB)`);

    redisClient.set(key, JSON.stringify(body), "EX", ttlSeconds).catch((err) => {
      console.error(`[Redis Error] SET ${key}:`, err.message);
    });

    return originalJson.call(this, body);
  };

  next();
};

module.exports = {
  redisClient,
  cacheMiddleware,
};
