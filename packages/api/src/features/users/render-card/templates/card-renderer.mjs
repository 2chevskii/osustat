export class CardRenderer {
  constructor(templateProvider) {
    this.templateProvider = templateProvider
  }

  async renderCompact(shortStats, shortUserInfo) {
    const template = await this.templateProvider.get('compact')
    const svg = template({ global_rank: shortStats.rank, pp_count: shortStats.pp, username: shortUserInfo.username })
    return svg
  }
}
