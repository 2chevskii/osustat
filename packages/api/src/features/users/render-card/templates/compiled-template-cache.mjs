const EXPIRATION_SECONDS = 30

/** @typedef {(context: Record<string, string | number>) => string} CardTemplate */
/** @typedef {{ template: CardTemplate, expiresAt: number }} CachedTemplate */

export class CompiledTemplateCache {
  constructor() {
    /** @type {Map<string, CachedTemplate>} */
    this.cache = new Map()
  }

  /** @param {string} templateName @returns {CachedTemplate | null} */
  get(templateName) {
    if (!this.cache.has(templateName)) return null
    return this.cache.get(templateName) ?? null
  }

  /** @param {string} templateName @param {CardTemplate} template */
  set(templateName, template) {
    const expiresAt = CompiledTemplateCache.getExpirationTime()
    this.cache.set(templateName, { template, expiresAt })
  }

  evictExpiredTemplates() {
    console.log('Evicting expired templates...')
    let deletedCount = 0
    for (const [key, { expiresAt }] of Array.from(this.cache.entries())) {
      if (expiresAt > Date.now()) continue

      this.cache.delete(key)
      deletedCount++
    }

    console.log('Evicted %d expired templates', deletedCount)
  }

  /** @returns {number} */
  static getExpirationTime() {
    return Date.now() + EXPIRATION_SECONDS * 1000
  }
}
