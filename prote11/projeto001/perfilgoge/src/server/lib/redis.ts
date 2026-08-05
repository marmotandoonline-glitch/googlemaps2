import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new IORedis(redisUrl);

redis.on('connect', () => console.log('🔁 Connected to Redis'));
redis.on('error', (err) => console.error('Redis error', err));

export default redis;
