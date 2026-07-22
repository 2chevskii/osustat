import cron from 'node-cron'

const EXPIRATION_SECONDS = 30

export class CompiledTemplateCache {
  constructor() {
    this.cache = new Map();
  }

  get(templateName) {
    if (!this.cache.has(templateName))
      return null;
    return this.cache.get(templateName);
  }

  set(templateName, template) {
    const expiresAt = CompiledTemplateCache.getExpirationTime()
    this.cache.set(templateName, { template, expiresAt });
  }

  evictExpiredTemplates() {
    console.log('Evicting expired templates...')
    let deletedCount = 0
    for (const [key, { expiresAt }] of Array.from(this.cache.entries())) {
      if (expiresAt > Date.now())
        continue

      this.cache.delete(key)
      deletedCount++
    }

    console.log('Evicted %d expired templates', deletedCount)
  }

  static getExpirationTime() {
    return Date.now() + (EXPIRATION_SECONDS * 1000)
  }
}
