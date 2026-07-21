export const renderCardByUsernameRoute = handler => async (request, reply) => {
  const { username, size } = request.params
  validateSize(size)
  validateUsername(username)
  const shortStats = await handler.handle({ username }, size)
  reply.send(shortStats)
}

export const renderCardByIdRoute = handler => async (request, reply) => {
  const { id, size } = request.params
  validateSize(size)
  const numericId = parseAndValidateId(id)
  const shortStats = await handler.handle({ id: numericId }, size)
  await reply.send(shortStats)
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
