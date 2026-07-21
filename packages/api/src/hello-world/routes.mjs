export function registerHelloWorldEndpoint(fastify) {
  fastify.get('/', async (request, reply) => {
    reply.send('Hello world!')
  })
}
