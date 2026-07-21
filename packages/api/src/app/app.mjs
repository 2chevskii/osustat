import Fastify from 'fastify'
import { registerHealthEndpoint } from '../health/routes.mjs'
import { registerHelloWorldEndpoint } from '../hello-world/routes.mjs';
import { OsuApiClient } from '../infrastructure/osu-api/client.mjs';
import { OsuApiAuthorizationManager } from '../infrastructure/osu-api/authorization-manager.mjs';
import { playersPlugin } from '../features/users/players-plugin.mjs';
import { RenderCardHandler } from '../features/users/render-card/handler.mjs';
import { UserService } from '../features/users/shared/user-service.mjs';
import { UserDataService } from '../features/users/shared/user-data-service.mjs';
import { UserCacheService } from '../features/users/shared/user-cache-service.mjs';
import { createClient as createRedisClient } from 'redis'

export class App {
  constructor({ port, osuClientId, osuClientSecret } = {}) {
    this.port = port;
    this.fastify = Fastify({ logger: true })

    this.redis = createRedisClient()

    this.osuApiClient = new OsuApiClient()
    this.osuApiAuthorizationManager = new OsuApiAuthorizationManager(this.osuApiClient, {
      clientId: osuClientId,
      clientSecret: osuClientSecret,
    })

    this.userService = new UserService(this.osuApiClient)
    this.userCacheService = new UserCacheService(this.redis)
    this.userDataService = new UserDataService(this.userService, this.userCacheService)

    this.registerEndpoints()

    console.log('App started')
  }

  async run() {
    await this.redis.connect()
    await this.fastify.listen({ port: this.port ?? 3001 })
  }

  registerEndpoints() {
    this.fastify.register(registerHealthEndpoint)
    this.fastify.register(registerHelloWorldEndpoint)

    const renderCardHandler = new RenderCardHandler(this.userDataService)
    this.fastify.register(playersPlugin, { handler: renderCardHandler })
  }
}
