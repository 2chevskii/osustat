import { EnvironmentModeUnsupportedError } from "./errors.mjs"
import { getRequiredEnv } from './utility.mjs'

export class AppConfiguration {
  port = 3000
  redisUrl = 'redis://localhost:6379'
  osuClientId = ''
  osuClientSecret = ''

  /**
   * @param {NodeJS.MODE} mode
   */
  constructor(mode) {
    this.mode = mode
  }

  /**
   *
   * @param {NodeJS.ProcessEnv} env
   * @returns {Promise<void>}
   */
  async load(env) {
    if (this.mode === 'development') {
      const dotenv = await import('dotenv')
      dotenv.config({ path: '.env.local' })
    }

    this.port = parseInt(getRequiredEnv(env, 'PORT'))
    if (Number.isNaN(this.port))
      throw new Error('Failed to parse PORT')

    this.redisUrl = getRequiredEnv(env, 'REDIS_URL')
    if (!this.redisUrl.startsWith('redis://'))
      throw new Error(`Invalid Redis URL: ${this.redisUrl}`)

    this.osuClientId = getRequiredEnv(env, 'OSU_CLIENTID')
    if (this.osuClientId.length === 0)
      throw new Error('OSU_CLIENTID cannot be empty')

    this.osuClientSecret = getRequiredEnv(env, 'OSU_CLIENTSECRET')
    if (this.osuClientSecret.length === 0)
      throw new Error('OSU_CLIENTSECRET cannot be empty')
  }

  /**
   * @param {NodeJS.ProcessEnv} processEnv
   * @returns {NodeJS.MODE}
   */
  static getEnvironment(processEnv) {
    const mode = processEnv['MODE']?.toLowerCase()

    switch (mode) {
      case undefined:
        return 'development'

      case 'production':
      case 'development':
        return mode

      default:
        throw new EnvironmentModeUnsupportedError(mode)
    }
  }
}
