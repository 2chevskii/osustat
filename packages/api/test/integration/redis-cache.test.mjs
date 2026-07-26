import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { createClient } from 'redis'
import { UserCacheService } from '../../src/features/users/shared/user-cache-service.mjs'
import { CardTemplateCache } from '../../src/features/users/render-card/templates/card-template-cache.mjs'
import { CompiledTemplateCache } from '../../src/features/users/render-card/templates/compiled-template-cache.mjs'

/** @type {StartedRedisContainer} */
let container
/** @type {import('redis').RedisClientType} */
let redis

before(async () => {
  container = await new RedisContainer('redis:8-alpine').start()
  redis = createClient({ url: container.getConnectionUrl() })
  await redis.connect()
})

beforeEach(async () => {
  await redis.flushDb()
})

after(async () => {
  await redis?.close()
  await container?.stop()
})

test('persists user cache values in Redis with their configured TTL', async () => {
  const cache = new UserCacheService(redis, 90)
  const shortInfo = {
    username: 'peppy',
    avatarUrl: 'https://example.test/avatar.png',
    followerCount: 7,
    joinedAt: '2020-01-02T00:00:00Z',
  }
  const shortStats = {
    rank: 11,
    pp: 12345,
    countryRank: 2,
    playTime: 3600,
    playCount: 300,
    level: 99,
    accuracy: 98.76,
    rankedScore: 1000,
    totalScore: 2000,
    highestRank: 5,
  }

  await cache.setId('peppy', 42)
  await cache.setShortInfo(42, shortInfo)
  await cache.setShortStats(42, shortStats)

  assert.equal(await cache.getId('peppy'), 42)
  assert.deepEqual(await cache.getShortInfo(42), shortInfo)
  assert.deepEqual(await cache.getShortStats(42), shortStats)
  assert.ok((await redis.ttl(cache.keys.id('peppy'))) > 3500)
  assert.ok((await redis.ttl(cache.keys.shortInfo(42))) > 80)
})

test('shares card template sources through the namespaced Redis key', async () => {
  const source = '<svg>{{username}}</svg>'
  const writer = new CardTemplateCache(redis, new CompiledTemplateCache())
  await writer.set('compact', source, () => '<svg>compiled</svg>')

  assert.equal(await redis.get('templates.cards:compact'), source)

  const reader = new CardTemplateCache(redis, new CompiledTemplateCache())
  assert.equal(await reader.get('compact'), source)
  assert.ok((await redis.ttl('templates.cards:compact')) > 1700)
})
