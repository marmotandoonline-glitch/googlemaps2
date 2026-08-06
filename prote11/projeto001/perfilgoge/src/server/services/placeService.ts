import { prisma } from '../lib/prisma';
import redis from '../lib/redis';
import fetch from 'node-fetch';

const GOOGLE_FAILURE_KEY = 'google:failure_count';
const GOOGLE_DISABLED_KEY = 'google:disabled_until';
const FAILURE_THRESHOLD = 5;
const DISABLE_SECONDS = 60 * 5; // 5 minutes
const PLACE_CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function isGoogleDisabled() {
  const disabledUntil = await redis.get(GOOGLE_DISABLED_KEY);
  if (!disabledUntil) return false;
  const ts = parseInt(disabledUntil, 10);
  return Date.now() < ts;
}

async function recordGoogleFailure() {
  const cnt = await redis.incr(GOOGLE_FAILURE_KEY);
  if (cnt >= FAILURE_THRESHOLD) {
    const until = Date.now() + DISABLE_SECONDS * 1000;
    await redis.set(GOOGLE_DISABLED_KEY, String(until));
    await redis.del(GOOGLE_FAILURE_KEY);
  }
}

async function resetGoogleFailures() {
  await redis.del(GOOGLE_FAILURE_KEY);
  await redis.del(GOOGLE_DISABLED_KEY);
}

export async function getPlaceDetailsWithCache(placeId: string, apiKey: string) {
  if (!placeId) return null;

  // check cache in Redis
  const cacheKey = `place:${placeId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // fallthrough
    }
  }

  // circuit breaker check
  if (await isGoogleDisabled()) {
    // try DB cache as fallback
    const rec = await prisma.placeCache.findUnique({ where: { placeId } });
    if (rec) return rec.data as any;
    throw new Error('Google Places temporarily disabled due to repeated failures');
  }

  // Call Google Place Details with retries & exponential backoff
  const fields = 'name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,opening_hours,types';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}&language=pt-BR&fields=${fields}`;

  let attempts = 0;
  const maxAttempts = 3;
  let lastErr: any = null;
  while (attempts < maxAttempts) {
    try {
      const r = await fetch(url);
      const json = await r.json() as any;
      const details = json?.result || {};

      const payload = {
        name: details.name || null,
        formatted_phone_number: details.formatted_phone_number || null,
        website: details.website || null,
        rating: details.rating || null,
        user_ratings_total: details.user_ratings_total || null,
        formatted_address: details.formatted_address || null,
        opening_hours: details.opening_hours || null,
        types: details.types || null,
      };

      // persist cache in Redis and DB
      await redis.set(cacheKey, JSON.stringify(payload), 'EX', PLACE_CACHE_TTL);
      await prisma.placeCache.upsert({ where: { placeId }, update: { data: payload, lastEnrichedAt: new Date() }, create: { placeId, name: payload.name || '', data: payload } });

      // reset failure counter
      await resetGoogleFailures();

      return payload;
    } catch (err) {
      lastErr = err;
      attempts += 1;
      await recordGoogleFailure();
      const backoff = Math.pow(2, attempts) * 200;
      await new Promise((res) => setTimeout(res, backoff));
    }
  }

  // after retries, try DB cache
  const rec = await prisma.placeCache.findUnique({ where: { placeId } });
  if (rec) return rec.data as any;

  throw lastErr || new Error('Failed to fetch place details');
}
