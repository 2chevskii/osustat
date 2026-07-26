import assert from 'node:assert/strict'
import test from 'node:test'
import { RenderCardHandler } from '../../src/features/users/render-card/handler.mjs'

test('resolves a username and renders a compact card from short user data', async () => {
  const userData = /** @type {any} */ ({
    userService: {},
    userCacheService: {},
    resolveUserIdByUsername: async (/** @type {string} */ username) => {
      assert.equal(username, 'peppy')
      return 42
    },
    getUserShortStats: async (/** @type {number} */ userId) => {
      assert.equal(userId, 42)
      return { rank: 1 }
    },
    getUserShortInfo: async (/** @type {number} */ userId) => {
      assert.equal(userId, 42)
      return { username: 'peppy' }
    },
    fetchAndUpdateCachedUserByUsername: async () => {
      throw new Error('Not implemented')
    },
    fetchAndUpdateCachedUserById: async () => {
      throw new Error('Not implemented')
    },
    updateCachedUser: async () => {
      throw new Error('Not implemented')
    },
  })
  const renderer = /** @type {any} */ ({
    renderCompact: async (/** @type {{ rank: number }} */ stats, /** @type {{ username: string }} */ info) => {
      assert.deepEqual(stats, { rank: 1 })
      assert.deepEqual(info, { username: 'peppy' })
      return '<svg>compact</svg>'
    },
    renderFull: async () => {
      throw new Error('Not implemented')
    },
    renderPng: async () => {
      throw new Error('Not implemented')
    },
  })
  const handler = new RenderCardHandler(userData, renderer)

  assert.equal(
    await handler.handle({ username: 'peppy' }, 'compact'),
    '<svg>compact</svg>',
  )
})

test('rejects an unresolved username before reading user data', async () => {
  const handler = new RenderCardHandler(
    /** @type {any} */ ({
      userService: {},
      userCacheService: {},
      resolveUserIdByUsername: async () => 0,
      getUserShortStats: async () => assert.fail('must not load stats'),
      getUserShortInfo: async () => assert.fail('must not load info'),
      fetchAndUpdateCachedUserByUsername: async () => {
        throw new Error('Not implemented')
      },
      fetchAndUpdateCachedUserById: async () => {
        throw new Error('Not implemented')
      },
      updateCachedUser: async () => {
        throw new Error('Not implemented')
      },
    }),
    /** @type {any} */ ({}),
  )

  await assert.rejects(
    handler.handle({ username: 'unknown' }, 'full'),
    /Cannot resolve userID/,
  )
})
