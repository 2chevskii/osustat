export class CardTemplateCache {
  constructor(redisClient, compiledTemplateCache) {
    this.redis = redisClient;
    this.compiledCache = compiledTemplateCache;
  }

  async get(templateName) {
    let compiled = this.getFromCompiledCache(templateName);
    if (compiled !== null)
      return compiled;

    let source = await this.getFromRedisCache(templateName);
    return source;
  }

  async set(templateName, templateSource, template) {
    this.setToCompiledCache(templateName, template);
    await this.setToRedisCache(templateName, templateSource);
  }

  getFromCompiledCache(templateName) {
    return this.compiledCache.get(templateName);
  }

  setToCompiledCache(templateName, template) {
    this.compiledCache.set(templateName, template);
  }

  async getFromRedisCache(templateName) {
    return await this.redis.get(this.getRedisKey(templateName));
  }

  async setToRedisCache(templateName, templateSource) {
    await this.redis.setEx(templateName, 1800, templateSource);
  }

  getRedisKey(templateName) {
    return `templates.cards:${templateName}`;
  }
}
