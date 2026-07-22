import { UserCacheService } from "./user-cache-service.mjs"
import { UserService } from "./user-service.mjs"

export class UserDataService {
  /**
   *
   * @param {UserService} userService
   * @param {UserCacheService} userCacheService
   */
  constructor(userService, userCacheService) {
    this.userService = userService
    this.userCacheService = userCacheService
  }

  /** @param {string} username @returns {Promise<number>} */
  async resolveUserIdByUsername(username) {
    const cachedId = await this.userCacheService.getId(username)
    if (cachedId !== null)
      return cachedId

    const user = await this.fetchAndUpdateCachedUserByUsername(username)
    return user.id
  }

  /** @param {number} userId @returns {Promise<import('./user-cache-service.mjs').ShortStats>} */
  async getUserShortStats(userId) {
    const cachedStats = await this.userCacheService.getShortStats(userId)
    console.log('Cached stats', cachedStats)
    if (cachedStats !== null)
      return cachedStats

    await this.fetchAndUpdateCachedUserById(userId)
    console.log('Stats updated')
    const stats = await this.userCacheService.getShortStats(userId)
    if (stats === null) throw new Error('Short stats were not cached')
    return stats
  }

  /** @param {number} userId @returns {Promise<import('./user-cache-service.mjs').ShortUserInfo>} */
  async getUserShortInfo(userId) {
    const cachedInfo = await this.userCacheService.getShortInfo(userId)
    console.log('Cached stats', cachedInfo)
    if (cachedInfo !== null)
      return cachedInfo

    await this.fetchAndUpdateCachedUserById(userId)
    console.log('Stats updated')
    const info = await this.userCacheService.getShortInfo(userId)
    if (info === null) throw new Error('Short user info was not cached')
    return info
  }

  /** @param {string} username @returns {Promise<import('./user-service.mjs').OsuUser>} */
  async fetchAndUpdateCachedUserByUsername(username) {
    const user = await this.userService.getByUsername(username);
    await this.updateCachedUser(user)
    return user;
  }

  /** @param {number} userId @returns {Promise<import('./user-service.mjs').OsuUser>} */
  async fetchAndUpdateCachedUserById(userId) {
    const user = await this.userService.getById(userId);
    await this.updateCachedUser(user)
    return user;
  }

  /** @param {import('./user-service.mjs').OsuUser} user */
  async updateCachedUser(user) {
    const shortInfo = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      isSupporter: user.is_supporter,
      countryCode: user.country_code,
      followerCount: user.follower_count,
      joinedAt: user.join_date,
    }

    const shortStats = {
      rank: user.statistics.global_rank,
      countryRank: user.statistics.country_rank,
      pp: user.statistics.pp,
      rankedScore: user.statistics.ranked_score,
      totalScore: user.statistics.total_score,
      playCount: user.statistics.play_count,
      playTime: user.statistics.play_time,
      level: user.statistics.level.current,
      highestRank: user.statistics.rank_highest?.rank,
      accuracy: user.statistics.hit_accuracy ?? user.statistics.accuracy ?? 0,
    }

    await this.userCacheService.setId(user.username, user.id)
    await this.userCacheService.setShortInfo(user.id, shortInfo)
    await this.userCacheService.setShortStats(user.id, shortStats)
  }
}
