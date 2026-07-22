/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export function registerHealthEndpoint(fastify) {
  fastify.get('/healthz', async (_, reply) => {
    reply.status(200)
  })
}
