import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import Fastify from 'fastify'
import { RedisContainer } from '@testcontainers/redis'
import { createClient } from 'redis'
import { registerHealthEndpoint } from '../../src/health/routes.mjs'
import { playersPlugin } from '../../src/features/users/players-plugin.mjs'
import { RenderCardHandler } from '../../src/features/users/render-card/handler.mjs'
import { CardRenderer } from '../../src/features/users/render-card/templates/card-renderer.mjs'
import { CardTemplateProvider } from '../../src/features/users/render-card/templates/card-template-provider.mjs'
import { CardTemplateCache } from '../../src/features/users/render-card/templates/card-template-cache.mjs'
import { CompiledTemplateCache } from '../../src/features/users/render-card/templates/compiled-template-cache.mjs'

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

async function buildApp() {
  const userDataService =
    /** @type {import('../../src/features/users/shared/user-data-service.mjs').UserDataService} */ ({
      /** @param {string} username */
      async resolveUserIdByUsername(username) {
        assert.equal(username, 'peppy')
        return 42
      },
      /** @param {number} userId */
      async getUserShortStats(userId) {
        assert.equal(userId, 42)
        return {
          rank: 1234,
          countryRank: 56,
          pp: 9876,
          rankedScore: 1234567,
          totalScore: 2345678,
          playCount: 321,
          playTime: 7200,
          level: 100,
          highestRank: 12,
          accuracy: 98.76,
        }
      },
      /** @param {number} userId */
      async getUserShortInfo(userId) {
        assert.equal(userId, 42)
        return {
          username: 'peppy',
          avatarUrl: 'https://example.test/avatar.png',
          followerCount: 42,
          joinedAt: '2020-01-02T00:00:00Z',
        }
      },
      /** @param {string} username */
      async fetchAndUpdateCachedUserByUsername(username) {
        void username
        throw new Error('Not implemented')
      },
      /** @param {number} userId */
      async fetchAndUpdateCachedUserById(userId) {
        void userId
        throw new Error('Not implemented')
      },
      /** @param {import('../../src/features/users/shared/user-service.mjs').OsuUser} user */
      async updateCachedUser(user) {
        void user
        throw new Error('Not implemented')
      },
      userService:
        /** @type {import('../../src/features/users/shared/user-service.mjs').UserService} */ ({}),
      userCacheService:
        /** @type {import('../../src/features/users/shared/user-cache-service.mjs').UserCacheService} */ ({}),
    })
  const templateCache = new CardTemplateCache(
    redis,
    new CompiledTemplateCache(),
  )
  const renderer = new CardRenderer(new CardTemplateProvider(templateCache))
  const handler = new RenderCardHandler(userDataService, renderer)
  const app = Fastify()
  app.register(registerHealthEndpoint)
  app.register(playersPlugin, { handler })
  await app.ready()
  return app
}

test('serves the health endpoint', async (t) => {
  const app = await buildApp()
  t.after(() => app.close())

  const response = await app.inject('/healthz')

  assert.equal(response.statusCode, 200)
})

test('renders a full SVG card for a player ID', async (t) => {
  const app = await buildApp()
  t.after(() => app.close())

  const response = await app.inject('/api/players/id/42/cards/full.svg')

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'image/svg+xml; charset=utf-8')
  assert.match(response.body, /peppy/)
  assert.equal(typeof (await redis.get('templates.cards:full')), 'string')
})

test('renders a compact SVG card for a player username', async (t) => {
  const app = await buildApp()
  t.after(() => app.close())

  const response = await app.inject(
    '/api/players/username/peppy/cards/compact.svg',
  )

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'image/svg+xml; charset=utf-8')
  assert.match(response.body, /peppy/)
  assert.equal(typeof (await redis.get('templates.cards:compact')), 'string')
})

test('renders a full PNG card for a player ID', async (t) => {
  const app = await buildApp()
  t.after(() => app.close())

  const response = await app.inject('/api/players/id/42/cards/full.png')

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'image/png')
  assert.deepEqual(
    response.rawPayload.subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  )
})

test('renders a compact PNG card for a player username', async (t) => {
  const app = await buildApp()
  t.after(() => app.close())

  const response = await app.inject(
    '/api/players/username/peppy/cards/compact.png',
  )

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'image/png')
  assert.deepEqual(
    response.rawPayload.subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  )
})
