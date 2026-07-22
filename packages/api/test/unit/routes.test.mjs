import assert from 'node:assert/strict'
import test from 'node:test'
import Fastify from 'fastify'
import { playersPlugin } from '../../src/features/users/players-plugin.mjs'
import { registerHealthEndpoint } from '../../src/health/routes.mjs'

async function buildApp(handler) {
  const app = Fastify()
  app.register(registerHealthEndpoint)
  app.register(playersPlugin, { handler })
  await app.ready()
  return app
}

test('serves the health endpoint', async t => {
  const app = await buildApp({})
  t.after(() => app.close())

  const response = await app.inject('/healthz')
  assert.equal(response.statusCode, 200)
})

test('renders an SVG card for a numeric player id', async t => {
  const calls = []
  const app = await buildApp({
    handle: async (...args) => {
      calls.push(args)
      return '<svg />'
    },
  })
  t.after(() => app.close())

  const response = await app.inject('/players/id/42/cards/full.svg')
  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'image/svg+xml; charset=utf-8')
  assert.equal(response.body, '<svg />')
  assert.deepEqual(calls, [[{ id: 42 }, 'full']])
})

test('renders PNG cards by username and rejects unsupported card sizes', async t => {
  const calls = []
  const app = await buildApp({
    handlePng: async (...args) => {
      calls.push(args)
      return Buffer.from([137, 80, 78, 71])
    },
  })
  t.after(() => app.close())

  const pngResponse = await app.inject('/players/username/peppy/cards/compact.png')
  assert.equal(pngResponse.statusCode, 200)
  assert.equal(pngResponse.headers['content-type'], 'image/png')
  assert.deepEqual(calls, [[{ username: 'peppy' }, 'compact']])

  const invalidResponse = await app.inject('/players/id/42/cards/large.svg')
  assert.equal(invalidResponse.statusCode, 500)
  assert.match(invalidResponse.json().message, /Invalid card size: large/)
})
