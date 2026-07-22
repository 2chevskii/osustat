export const renderCardByUsernameRoute = (handler, format = 'svg') => async (request, reply) => {
  const { username, size } = request.params
  validateSize(size)
  validateUsername(username)
  const card = await renderCard(handler, { username }, size, format)
  reply.headers({
    'Content-Type': contentTypeFor(format)
  })
  reply.send(card)
}

export const renderCardByIdRoute = (handler, format = 'svg') => async (request, reply) => {
  const { id, size } = request.params
  validateSize(size)
  const numericId = parseAndValidateId(id)
  const card = await renderCard(handler, { id: numericId }, size, format)
  reply.headers({
    'Content-Type': contentTypeFor(format)
  })
  reply.send(card)
}

async function renderCard(handler, identifier, size, format) {
  return format === 'png'
    ? handler.handlePng(identifier, size)
    : handler.handle(identifier, size)
}

function contentTypeFor(format) {
  return format === 'png' ? 'image/png' : 'image/svg+xml; charset=utf-8'
}

function validateSize(size) {
  switch (size) {
    case 'compact':
    case 'full':
      return;
    default: throw new Error('Invalid card size: ' + size)
  }
}

function parseAndValidateId(id) {

  const numericId = parseInt(id)
  if (Number.isNaN(numericId))
    throw new Error('Invalid userID: ' + id)
  return numericId
}

function validateUsername(username) {
  if (typeof username !== 'string')
    throw new Error('Invalid username: Expected string, but got ' + typeof username)

  if (username.length === 0)
    throw new Error('Invalid username: Username length must be greater than zero')
}
