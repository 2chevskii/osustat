export class CardTemplateCache {
  /** @param {RedisCache} redisClient @param {import('./compiled-template-cache.mjs').CompiledTemplateCache} compiledTemplateCache */
  constructor(redisClient, compiledTemplateCache) {
    this.redis = redisClient
    this.compiledCache = compiledTemplateCache
  }

  /** @param {string} templateName @returns {Promise<CardTemplate | string | null>} */
  async get(templateName) {
    let compiled = this.getFromCompiledCache(templateName)
    if (compiled !== null) return compiled

    let source = await this.getFromRedisCache(templateName)
    return source
  }

  /** @param {string} templateName @param {string} templateSource @param {CardTemplate} template */
  async set(templateName, templateSource, template) {
    this.setToCompiledCache(templateName, template)
    await this.setToRedisCache(templateName, templateSource)
  }

  /** @param {string} templateName @returns {CardTemplate | null} */
  getFromCompiledCache(templateName) {
    return this.compiledCache.get(templateName)?.template ?? null
  }

  /** @param {string} templateName @param {CardTemplate} template */
  setToCompiledCache(templateName, template) {
    this.compiledCache.set(templateName, template)
  }

  /** @param {string} templateName */
  async getFromRedisCache(templateName) {
    return await this.redis.get(this.getRedisKey(templateName))
  }

  /** @param {string} templateName @param {string} templateSource */
  async setToRedisCache(templateName, templateSource) {
    await this.redis.setEx(this.getRedisKey(templateName), 1800, templateSource)
  }

  /** @param {string} templateName */
  getRedisKey(templateName) {
    return `templates.cards:${templateName}`
  }
}

/** @typedef {{ get(key: string): Promise<string | null>, setEx(key: string, seconds: number, value: string): Promise<unknown> }} RedisCache */
/** @typedef {import('./compiled-template-cache.mjs').CardTemplate} CardTemplate */
