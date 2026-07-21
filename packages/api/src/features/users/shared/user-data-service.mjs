export class UserDataService {
  constructor(userService, userCacheService) {
    this.userService = userService
    this.userCacheService = userCacheService
  }

  async resolveUserIdByUsername(username) {
    const cachedId = await this.userCacheService.getId(username)
    if (cachedId !== null)
      return cachedId

    const user = await this.fetchAndUpdateCachedUserByUsername(username)
    return user.id
  }

  async getUserShortStats(userId) {
    const cachedStats = await this.userCacheService.getShortStats(userId)
    console.log('Cached stats', cachedStats)
    if (cachedStats !== null)
      return cachedStats

    await this.fetchAndUpdateCachedUserById(userId)
    console.log('Stats updated')
    return await this.userCacheService.getShortStats(userId)
  }

  async fetchAndUpdateCachedUserByUsername(username) {
    const user = await this.userService.getByUsername(username);
    await this.updateCachedUser(user)
    return user;
  }

  async fetchAndUpdateCachedUserById(userId) {
    const user = await this.userService.getById(userId);
    await this.updateCachedUser(user)
    return user;
  }

  async updateCachedUser(user) {
    const shortInfo = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      isSupporter: user.is_supporter,
      countryCode: user.country_code,
    }

    const shortStats = {
      rank: user.statistics.global_rank,
      pp: user.statistics.pp,
      rankedScore: user.statistics.ranked_score,
      playCount: user.statistics.play_count,
      accuracy: user.statistics.accuracy,
    }

    await this.userCacheService.setId(user.username, user.id)
    await this.userCacheService.setShortInfo(user.id, shortInfo)
    await this.userCacheService.setShortStats(user.id, shortStats)
  }
}
