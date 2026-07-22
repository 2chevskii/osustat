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
  const userService = {
    getByUsername: async () => assert.fail('must not fetch'),
  }
  const cache = { getId: async () => 42 }
  const service = new UserDataService(userService, cache)

  assert.equal(await service.resolveUserIdByUsername('peppy'), 42)
})

test('fetches a cache miss and stores the mapped user data', async () => {
  const updates = []
  const userService = {
    getByUsername: async (username) => {
      assert.equal(username, 'peppy')
      return osuUser
    },
  }
  const cache = {
    getId: async () => null,
    setId: async (...args) => updates.push(['id', ...args]),
    setShortInfo: async (...args) => updates.push(['info', ...args]),
    setShortStats: async (...args) => updates.push(['stats', ...args]),
  }
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
  const cachedStats = { rank: 1, pp: 999 }
  const userService = { getById: async () => assert.fail('must not fetch') }
  const cache = { getShortStats: async () => cachedStats }
  const service = new UserDataService(userService, cache)

  assert.deepEqual(await service.getUserShortStats(42), cachedStats)
})
