import Fastify from 'fastify'
import { registerHealthEndpoint } from '../health/routes.mjs'
import { OsuApiClient } from '../infrastructure/osu-api/client.mjs';
import { OsuApiAuthorizationManager } from '../infrastructure/osu-api/authorization-manager.mjs';
import { playersPlugin } from '../features/users/players-plugin.mjs';
import { RenderCardHandler } from '../features/users/render-card/handler.mjs';
import { UserService } from '../features/users/shared/user-service.mjs';
import { UserDataService } from '../features/users/shared/user-data-service.mjs';
import { UserCacheService } from '../features/users/shared/user-cache-service.mjs';
import { createClient as createRedisClient } from 'redis'
import { CardTemplateProvider } from '../features/users/render-card/templates/card-template-provider.mjs';
import { CardTemplateCache } from '../features/users/render-card/templates/card-template-cache.mjs';
import { CompiledTemplateCache } from '../features/users/render-card/templates/compiled-template-cache.mjs';
import { CardRenderer } from '../features/users/render-card/templates/card-renderer.mjs';
import cron from 'node-cron'
import pino from 'pino'

/** @typedef {{ port?: number | undefined, osuClientId?: string | undefined, osuClientSecret?: string | undefined }} AppOptions */

export class App {
  /** @param {AppOptions} [options] */
  constructor({ port, osuClientId, osuClientSecret } = {}) {
    this.logger = pino({ level: 'trace' })

    this.logger.debug('Initializing App...')

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

    this.compiledTemplateCache = new CompiledTemplateCache();

    this.registerEndpoints()

    console.log('App started')
  }

  async run() {
    cron.schedule('* * * * *', async () => {
      this.compiledTemplateCache.evictExpiredTemplates()
    })
    await this.redis.connect()
    await this.fastify.listen({ port: this.port ?? 3001, host: '0.0.0.0' })
  }

  registerEndpoints() {
    this.fastify.register(registerHealthEndpoint)

    const cardTemplateProvider = new CardTemplateProvider(new CardTemplateCache(this.redis, this.compiledTemplateCache))
    const cardRenderer = new CardRenderer(cardTemplateProvider)

    const renderCardHandler = new RenderCardHandler(this.userDataService, cardRenderer)
    this.fastify.register(playersPlugin, { handler: renderCardHandler })
  }
}
