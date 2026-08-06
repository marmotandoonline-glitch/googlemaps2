import IORedis from 'ioredis';

export const redisUrl = process.env.REDIS_URL || '';
export const isUpstashRedis = /\.upstash\.io(?::\d+)?(?:\/|$)/i.test(redisUrl);
export const bullMqSupported = Boolean(redisUrl) && !isUpstashRedis;

// Upstash funciona para operações Redis simples, mas BullMQ v1 rejeita esse host
// por depender de comandos bloqueantes incompatíveis com a configuração serverless.
const redis = new IORedis(redisUrl || 'redis://localhost:6379', {
  lazyConnect: !redisUrl || isUpstashRedis,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

redis.on('connect', () => console.log('🔁 Connected to Redis'));
redis.on('error', (err) => console.error('Redis error', err));

export default redis;

export function getQueueAvailabilityMessage() {
  if (isUpstashRedis) {
    return 'A fila de IA está desativada porque o Redis Upstash não é compatível com esta versão do BullMQ. Configure um Redis padrão para habilitar a geração assíncrona.';
  }
  if (!redisUrl) {
    return 'REDIS_URL não está configurada; a fila de IA está indisponível.';
  }
  return 'A fila de IA está indisponível no momento.';
}

if (isUpstashRedis) {
  console.warn('⚠️ Redis Upstash detectado: BullMQ será desativado para manter a API disponível.');
}
