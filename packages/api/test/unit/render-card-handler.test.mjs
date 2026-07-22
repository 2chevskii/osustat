import assert from 'node:assert/strict'
import test from 'node:test'
import { RenderCardHandler } from '../../src/features/users/render-card/handler.mjs'

test('resolves a username and renders a compact card from short user data', async () => {
  const userData = {
    resolveUserIdByUsername: async username => {
      assert.equal(username, 'peppy')
      return 42
    },
    getUserShortStats: async userId => {
      assert.equal(userId, 42)
      return { rank: 1 }
    },
    getUserShortInfo: async userId => {
      assert.equal(userId, 42)
      return { username: 'peppy' }
    },
  }
  const renderer = {
    renderCompact: async (stats, info) => {
      assert.deepEqual(stats, { rank: 1 })
      assert.deepEqual(info, { username: 'peppy' })
      return '<svg>compact</svg>'
    },
  }
  const handler = new RenderCardHandler(userData, renderer)

  assert.equal(await handler.handle({ username: 'peppy' }, 'compact'), '<svg>compact</svg>')
})

test('rejects an unresolved username before reading user data', async () => {
  const handler = new RenderCardHandler({
    resolveUserIdByUsername: async () => 0,
    getUserShortStats: async () => assert.fail('must not load stats'),
    getUserShortInfo: async () => assert.fail('must not load info'),
  }, {})

  await assert.rejects(handler.handle({ username: 'unknown' }, 'full'), /Cannot resolve userID/)
})
