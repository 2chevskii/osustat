export class CardRenderer {
  constructor(templateProvider) {
    this.templateProvider = templateProvider
  }

  async renderCompact(shortStats) {
    const template = await this.templateProvider.get('compact')
    const svg = template(shortStats)
    return svg
  }
}
