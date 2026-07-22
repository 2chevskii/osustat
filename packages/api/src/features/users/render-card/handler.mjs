/** @typedef {{ id: number } | { username: string }} UserIdentifier */
/** @typedef {'compact' | 'full'} CardSize */

export class RenderCardHandler {
  /**
   * @param {import('../shared/user-data-service.mjs').UserDataService} userDataService
   * @param {import('./templates/card-renderer.mjs').CardRenderer} cardRenderer
   */
  constructor(userDataService, cardRenderer) {
    this.userDataService = userDataService
    this.renderer = cardRenderer
  }

  /** @param {UserIdentifier} userIdentifier @param {CardSize} cardSize @returns {Promise<string>} */
  async handle(userIdentifier, cardSize) {
    let userId

    if ('id' in userIdentifier) {
      userId = userIdentifier.id
    } else if ('username' in userIdentifier) {
      userId = await this.userDataService.resolveUserIdByUsername(
        userIdentifier.username,
      )
      if (userId === 0) {
        throw new Error('Cannot resolve userID by username')
      }
    } else throw new Error('Invalid user identifier')

    const shortStats = await this.userDataService.getUserShortStats(userId)
    console.log('Got user short stats', shortStats)
    const shortUserInfo = await this.userDataService.getUserShortInfo(userId)
    console.log('Got user short info', shortUserInfo)

    let svg
    if (cardSize === 'compact') {
      svg = await this.renderer.renderCompact(shortStats, shortUserInfo)
    } else if (cardSize === 'full') {
      svg = await this.renderer.renderFull(shortStats, shortUserInfo)
    } else {
      throw new Error('Not implemented')
    }
    return svg
  }

  /** @param {UserIdentifier} userIdentifier @param {CardSize} cardSize */
  async handlePng(userIdentifier, cardSize) {
    const svg = await this.handle(userIdentifier, cardSize)
    return this.renderer.renderPng(svg)
  }
}
