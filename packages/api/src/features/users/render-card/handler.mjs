export class RenderCardHandler {
  constructor(userDataService) {
    this.userDataService = userDataService
  }

  async handle(userIdentifier, cardSize) {
    let userId = 0

    if ('id' in userIdentifier) { userId = userIdentifier.id }
    else if ('username' in userIdentifier) {
      userId = await this.userDataService.resolveUserIdByUsername(userIdentifier.username)
      if (userId === 0) {
        throw new Error('Cannot resolve userID by username')
      }
    }
    else return


    const shortStats = await this.userDataService.getUserShortStats(userId)
    console.log('Got user short stats', shortStats)
    return shortStats
  }
}
