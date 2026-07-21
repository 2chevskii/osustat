export function registerHealthEndpoint(fastify) {
  fastify.get('/healthz', async (request, reply) => {
    reply.status(200)
  })
}
