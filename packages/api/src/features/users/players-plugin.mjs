import { renderCardByIdRoute } from './render-card/routes.mjs'
import { renderCardByUsernameRoute } from './render-card/routes.mjs'

/** @typedef {{ handler: import('./render-card/handler.mjs').RenderCardHandler }} PlayersPluginOptions */

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {PlayersPluginOptions} options
 */
export function playersPlugin(fastify, options) {
  const { handler } = options

  fastify.get(
    '/api/players/id/:id/cards/:size.svg',
    renderCardByIdRoute(handler),
  )
  fastify.get(
    '/api/players/username/:username/cards/:size.svg',
    renderCardByUsernameRoute(handler),
  )
  fastify.get(
    '/api/players/id/:id/cards/:size.png',
    renderCardByIdRoute(handler, 'png'),
  )
  fastify.get(
    '/api/players/username/:username/cards/:size.png',
    renderCardByUsernameRoute(handler, 'png'),
  )
}
