import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import Handlebars from 'handlebars'

/** @typedef {import('./compiled-template-cache.mjs').CardTemplate} CardTemplate */

export class CardTemplateProvider {
  /**
   * @param {import('./card-template-cache.mjs').CardTemplateCache} templateCache
   */
  constructor(templateCache) {
    this.cache = templateCache
  }

  /** @param {string} templateName @returns {Promise<CardTemplate>} */
  async get(templateName) {
    const cachedTemplate = await this.getCached(templateName)
    if (cachedTemplate !== null) return cachedTemplate

    const templateSource = await this.loadFromFs(templateName)
    const compiledTemplate = Handlebars.compile(templateSource)
    await this.cache.set(templateName, templateSource, compiledTemplate)

    return compiledTemplate
  }

  /** @param {string} templateName @returns {Promise<CardTemplate | null>} */
  async getCached(templateName) {
    const cachedTemplate = await this.cache.get(templateName)
    if (typeof cachedTemplate === 'string') {
      /** @type {CardTemplate} */
      const compiledTemplate = Handlebars.compile(cachedTemplate)
      await this.cache.set(templateName, cachedTemplate, compiledTemplate)
      return compiledTemplate
    } else if (typeof cachedTemplate === 'function') {
      return cachedTemplate
    } else {
      return null
    }
  }

  /** @param {string} templateSource @returns {CardTemplate} */
  compileTemplate(templateSource) {
    const template = Handlebars.compile(templateSource, { strict: true })
    return template
  }

  /** @param {string} templateName @returns {Promise<string>} */
  async loadFromFs(templateName) {
    const path = this.getTemplatePath(templateName)
    const fStat = await stat(path)
    if (!fStat.isFile()) throw new Error('File does not exist: ' + path)

    const templateSource = await readFile(path, { encoding: 'utf-8' })
    return templateSource
  }

  /** @param {string} templateName @returns {string} */
  getTemplatePath(templateName) {
    const assetsDir = join(import.meta.dirname, 'assets')
    const path = join(assetsDir, templateName + '.svg.hbs')
    return path
  }
}
