import Fastify from 'fastify'
import { registerHealthEndpoint } from '../health/routes.mjs'
import { OsuApiClient } from '../infrastructure/osu-api/client.mjs'
import { OsuApiAuthorizationManager } from '../infrastructure/osu-api/authorization-manager.mjs'
import { playersPlugin } from '../features/users/players-plugin.mjs'
import { RenderCardHandler } from '../features/users/render-card/handler.mjs'
import { UserService } from '../features/users/shared/user-service.mjs'
import { UserDataService } from '../features/users/shared/user-data-service.mjs'
import { UserCacheService } from '../features/users/shared/user-cache-service.mjs'
import { createClient as createRedisClient } from 'redis'
import { CardTemplateProvider } from '../features/users/render-card/templates/card-template-provider.mjs'
import { CardTemplateCache } from '../features/users/render-card/templates/card-template-cache.mjs'
import { CompiledTemplateCache } from '../features/users/render-card/templates/compiled-template-cache.mjs'
import { CardRenderer } from '../features/users/render-card/templates/card-renderer.mjs'
import cron from 'node-cron'
import pino from 'pino'
import cors from '@fastify/cors'

/** @import {AppConfiguration} from './configuration/index.mjs' */

export class App {
  /** @param {AppConfiguration} configuration */
  constructor(configuration) {
    this.configuration = configuration

    this.logger = pino({ level: 'trace' })

    this.logger.debug('Initializing App...')
    this.logger.info('MODE=%s', this.configuration.mode)

    this.fastify = Fastify({ logger: true })

    this.logger.debug(
      'Configuring CORS policy, allowed origins: %o',
      this.configuration.allowedCorsOrigins,
    )
    this.fastify = this.fastify.register(cors, {
      origin: this.configuration.allowedCorsOrigins,
      methods: ['GET'],
    })
    this.redis = createRedisClient({
      url: this.configuration.redisUrl
    })

    this.osuApiClient = new OsuApiClient()
    this.osuApiAuthorizationManager = new OsuApiAuthorizationManager(
      this.osuApiClient,
      {
        clientId: configuration.osuClientId,
        clientSecret: configuration.osuClientSecret,
      },
    )

    this.userService = new UserService(this.osuApiClient)
    this.userCacheService = new UserCacheService(this.redis)
    this.userDataService = new UserDataService(
      this.userService,
      this.userCacheService,
    )

    this.compiledTemplateCache = new CompiledTemplateCache()

    this.registerEndpoints()

    this.logger.info('App started')
  }

  async run() {
    cron.schedule('* * * * *', async () => {
      this.compiledTemplateCache.evictExpiredTemplates()
    })
    await this.redis.connect()
    await this.fastify.listen({
      port: this.configuration.port,
      host: '0.0.0.0',
    })
  }

  registerEndpoints() {
    this.fastify.register(registerHealthEndpoint)

    const cardTemplateProvider = new CardTemplateProvider(
      new CardTemplateCache(this.redis, this.compiledTemplateCache),
    )
    const cardRenderer = new CardRenderer(cardTemplateProvider)

    const renderCardHandler = new RenderCardHandler(
      this.userDataService,
      cardRenderer,
    )
    this.fastify.register(playersPlugin, { handler: renderCardHandler })
  }
}
