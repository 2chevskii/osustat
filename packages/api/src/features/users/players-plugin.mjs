import { renderCardByIdRoute } from "./render-card/routes.mjs"
import { renderCardByUsernameRoute } from "./render-card/routes.mjs"

export function playersPlugin(fastify, options) {
  const { handler } = options

  fastify.get('/players/id/:id/cards/:size.svg', renderCardByIdRoute(handler))
  fastify.get('/players/username/:username/cards/:size.svg', renderCardByUsernameRoute(handler))
}
