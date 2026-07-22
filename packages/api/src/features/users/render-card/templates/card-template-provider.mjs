import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'

export class CardTemplateProvider {
  /**
   * @param {ReturnType<import('redis').createClient>} redisClient
   */
  constructor(templateCache) {
    this.cache = templateCache
  }

  async get(templateName) {
    const cachedTemplate = await this.getCached(templateName)
    if (cachedTemplate !== null)
      return cachedTemplate

    const templateSource = await this.loadFromFs(templateName)
    const compiledTemplate = Handlebars.compile(templateSource)
    await this.cache.set(templateName, templateSource, compiledTemplate)

    return compiledTemplate
  }

  async getCached(templateName) {
    const cachedTemplate = await this.cache.get(templateName)
    if (typeof cachedTemplate === 'string') {
      const compiledTemplate = Handlebars.compile(cachedTemplate)
      await this.cache.set(templateName, cachedTemplate, compiledTemplate)
    } else if (typeof cachedTemplate === 'function') {
      return cachedTemplate
    } else {
      return null
    }
  }

  compileTemplate(templateSource) {
    const template = Handlebars.compile(templateSource, { strict: true })
    return template;
  }

  async loadFromFs(templateName) {
    const path = this.getTemplatePath(templateName)
    const fStat = await stat(path)
    if (!fStat.isFile())
      throw new Error('File does not exist: ' + path)

    const templateSource = await readFile(path, { encoding: 'utf-8' })
    return templateSource;
  }

  getTemplatePath(templateName) {
    const assetsDir = join(import.meta.dirname, 'assets')
    const path = join(assetsDir, templateName + '.svg.hb')
    return path
  }
}
