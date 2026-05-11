const Redis = require('ioredis');

let redis = null;

const connectRedis = () => {
  try {
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
      });
      redis.on('connect', () => console.log('Redis Connected'));
      redis.on('error', (err) => console.error('Redis Error:', err.message));
    }
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
  return redis;
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
