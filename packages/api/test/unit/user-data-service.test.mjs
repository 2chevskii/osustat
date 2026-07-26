import assert from 'node:assert/strict'
import test from 'node:test'
import { UserDataService } from '../../src/features/users/shared/user-data-service.mjs'

const osuUser = {
  id: 42,
  username: 'peppy',
  avatar_url: 'https://example.test/avatar.png',
  follower_count: 7,
  join_date: '2020-01-02T00:00:00Z',
  is_supporter: true,
  country_code: 'AU',
  statistics: {
    global_rank: 11,
    country_rank: 2,
    pp: 12345,
    ranked_score: 1000,
    total_score: 2000,
    play_count: 300,
    play_time: 3600,
    level: { current: 99 },
    rank_highest: { rank: 5 },
    hit_accuracy: 98.76,
  },
}

test('returns a cached user id without calling the osu API', async () => {
  const userService = /** @type {import('../../src/features/users/shared/user-service.mjs').UserService} */ (
    /** @type {unknown} */ ({
    getByUsername: async () => assert.fail('must not fetch'),
  }))
  const cache = /** @type {import('../../src/features/users/shared/user-cache-service.mjs').UserCacheService} */ (
    /** @type {unknown} */ ({
    getId: async () => 42,
  }))
  const service = new UserDataService(userService, cache)

  assert.equal(await service.resolveUserIdByUsername('peppy'), 42)
})

test('fetches a cache miss and stores the mapped user data', async () => {
  /** @type {Array<unknown[]>} */
  const updates = []
  const userService = /** @type {import('../../src/features/users/shared/user-service.mjs').UserService} */ (
    /** @type {unknown} */ ({
    /** @param {string} username */
    getByUsername: async (username) => {
      assert.equal(username, 'peppy')
      return osuUser
    },
  }))
  const cache = /** @type {import('../../src/features/users/shared/user-cache-service.mjs').UserCacheService} */ (
    /** @type {unknown} */ ({
    getId: async () => null,
    /** @param {string} username @param {number} userId */
    setId: async (username, userId) => {
      updates.push(['id', username, userId])
    },
    /** @param {number} userId @param {{ id: number, username: string, avatarUrl: string, followerCount: number, joinedAt: string, isSupporter: boolean, countryCode: string }} shortInfo */
    setShortInfo: async (userId, shortInfo) => {
      updates.push(['info', userId, shortInfo])
    },
    /** @param {number} userId @param {{ rank: number, countryRank: number, pp: number, rankedScore: number, totalScore: number, playCount: number, playTime: number, level: number, accuracy: number, highestRank: number | undefined }} shortStats */
    setShortStats: async (userId, shortStats) => {
      updates.push(['stats', userId, shortStats])
    },
  }))
  const service = new UserDataService(userService, cache)

  assert.equal(await service.resolveUserIdByUsername('peppy'), 42)
  assert.deepEqual(updates, [
    ['id', 'peppy', 42],
    [
      'info',
      42,
      {
        id: 42,
        username: 'peppy',
        avatarUrl: 'https://example.test/avatar.png',
        isSupporter: true,
        countryCode: 'AU',
        followerCount: 7,
        joinedAt: '2020-01-02T00:00:00Z',
      },
    ],
    [
      'stats',
      42,
      {
        rank: 11,
        countryRank: 2,
        pp: 12345,
        rankedScore: 1000,
        totalScore: 2000,
        playCount: 300,
        playTime: 3600,
        level: 99,
        highestRank: 5,
        accuracy: 98.76,
      },
    ],
  ])
})

test('uses cached short stats without fetching the user again', async () => {
  const userService = /** @type {import('../../src/features/users/shared/user-service.mjs').UserService} */ (
    /** @type {unknown} */ ({
    getById: async () => assert.fail('must not fetch'),
  }))
  const cache = /** @type {import('../../src/features/users/shared/user-cache-service.mjs').UserCacheService} */ (
    /** @type {unknown} */ ({
    getShortStats: async () => ({ rank: 1, pp: 999 }),
  }))
  const service = new UserDataService(userService, cache)

  assert.deepEqual(await service.getUserShortStats(42), { rank: 1, pp: 999 })
})
