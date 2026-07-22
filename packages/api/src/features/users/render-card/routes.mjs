/** @typedef {import('./handler.mjs').RenderCardHandler} RenderCardHandler */
/** @typedef {'compact' | 'full'} CardSize */
/** @typedef {'svg' | 'png'} CardFormat */

/** @param {RenderCardHandler} handler @param {CardFormat} [format] */
export const renderCardByUsernameRoute = (handler, format = 'svg') =>
  /** @param {import('fastify').FastifyRequest<{ Params: { username: string, size: CardSize } }>} request @param {import('fastify').FastifyReply} reply */
  async (request, reply) => {
  const { username, size } = request.params
  validateSize(size)
  validateUsername(username)
  const card = await renderCard(handler, { username }, size, format)
  reply.headers({
    'Content-Type': contentTypeFor(format)
  })
  reply.send(card)
  }

/** @param {RenderCardHandler} handler @param {CardFormat} [format] */
export const renderCardByIdRoute = (handler, format = 'svg') =>
  /** @param {import('fastify').FastifyRequest<{ Params: { id: string, size: CardSize } }>} request @param {import('fastify').FastifyReply} reply */
  async (request, reply) => {
  const { id, size } = request.params
  validateSize(size)
  const numericId = parseAndValidateId(id)
  const card = await renderCard(handler, { id: numericId }, size, format)
  reply.headers({
    'Content-Type': contentTypeFor(format)
  })
  reply.send(card)
  }

/** @param {RenderCardHandler} handler @param {{ id: number } | { username: string }} identifier @param {CardSize} size @param {CardFormat} format */
async function renderCard(handler, identifier, size, format) {
  return format === 'png'
    ? handler.handlePng(identifier, size)
    : handler.handle(identifier, size)
}

/** @param {CardFormat} format */
function contentTypeFor(format) {
  return format === 'png' ? 'image/png' : 'image/svg+xml; charset=utf-8'
}

/** @param {unknown} size asserts size is CardSize */
function validateSize(size) {
  switch (size) {
    case 'compact':
    case 'full':
      return;
    default: throw new Error('Invalid card size: ' + size)
  }
}

/** @param {unknown} id @returns {number} */
function parseAndValidateId(id) {

  if (typeof id !== 'string') throw new Error('Invalid userID: Expected string')
  const numericId = parseInt(id, 10)
  if (Number.isNaN(numericId))
    throw new Error('Invalid userID: ' + id)
  return numericId
}

/** @param {unknown} username asserts username is string */
function validateUsername(username) {
  if (typeof username !== 'string')
    throw new Error('Invalid username: Expected string, but got ' + typeof username)

  if (username.length === 0)
    throw new Error('Invalid username: Username length must be greater than zero')
}
