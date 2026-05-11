const Redis = require('ioredis');

let redis = null;
let redisAvailable = false;

const connectRedis = () => {
  try {
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 3) {
            console.warn('Redis unavailable after 3 retries. Running without Redis cache.');
            return null; // stop retrying
          }
          return Math.min(times * 200, 1000);
        },
      });
      redis.on('connect', () => {
        redisAvailable = true;
        console.log('Redis Connected');
      });
      redis.on('error', (err) => {
        redisAvailable = false;
        // Only log once to avoid spamming the console
      });
      redis.on('close', () => {
        redisAvailable = false;
      });

      // Attempt connection but don't block startup
      redis.connect().catch(() => {
        console.warn('Redis not available. The app will run without caching.');
        redis = null;
      });
    } else {
      console.log('No REDIS_URL configured. Running without Redis cache.');
    }
  } catch (error) {
    console.warn('Redis connection failed:', error.message, '- running without cache.');
    redis = null;
  }
  return redis;
};

const getRedis = () => (redisAvailable ? redis : null);

module.exports = { connectRedis, getRedis };
