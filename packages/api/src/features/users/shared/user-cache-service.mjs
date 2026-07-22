const USERID_EXPIRATION_SECONDS = 3600

/** @typedef {{ username: string, avatarUrl: string, followerCount: number, joinedAt: string }} ShortUserInfo */
/** @typedef {{ rank: number, pp: number, countryRank: number, playTime: number, playCount: number, level: number, accuracy: number, rankedScore: number, totalScore: number, highestRank: number | undefined }} ShortStats */
/** @typedef {{ get(key: string): Promise<string | null>, setEx(key: string, seconds: number, value: string): Promise<unknown> }} RedisCache */

export class UserCacheService {
  /**
   * @param {RedisCache} redisClient
   * @param {number} [expirationTimeSeconds]
   */
  constructor(redisClient, expirationTimeSeconds = 30) {
    this.redis = redisClient
    this.expirationTimeSeconds = expirationTimeSeconds
  }

  /** @returns {{ id(username: string): string, shortInfo(userId: number): string, shortStats(userId: number): string }} */
  get keys() {
    return {
      id: username => `userid_lookup:${username}`,
      shortInfo: userId => `user.info.short:${userId}`,
      shortStats: userId => `user.stats.short:${userId}`
    }
  }

  /** @param {string} username @returns {Promise<number | null>} */
  async getId(username) {
    const key = this.keys.id(username);
    const strId = await this.redis.get(key);
    const id = strId === null ? Number.NaN : parseInt(strId, 10)
    console.log('UserCacheService.getId', { key, strId, id })
    return Number.isNaN(id) ? null : id
  }

  /** @param {string} username @param {number} userId */
  async setId(username, userId) {
    const key = this.keys.id(username)
    await this.redis.setEx(key, USERID_EXPIRATION_SECONDS, String(userId))
    console.log('UserCacheService.setId', { username, userId, key })
  }

  /** @param {number} userId @returns {Promise<ShortUserInfo | null>} */
  async getShortInfo(userId) {
    const key = this.keys.shortInfo(userId)
    const shortInfo = await this.redis.get(key)
    /** @type {ShortUserInfo | null} */
    const value = shortInfo === null ? null : this.fromRedisValue(shortInfo)
    console.log('UserCacheService.getShortInfo', { userId, key, shortInfo, value })
    return value;
  }

  /** @param {number} userId @param {ShortUserInfo} shortInfo */
  async setShortInfo(userId, shortInfo) {
    const key = this.keys.shortInfo(userId);
    const value = this.toRedisValue(shortInfo)
    await this.redis.setEx(key, this.expirationTimeSeconds, value)
    console.log('UserCacheService.setShortInfo', { userId, key, expirationTimeSeconds: this.expirationTimeSeconds, shortInfo, value })
  }

  /** @param {number} userId @returns {Promise<ShortStats | null>} */
  async getShortStats(userId) {
    const key = this.keys.shortStats(userId);
    const shortStats = await this.redis.get(key)
    /** @type {ShortStats | null} */
    const value = shortStats === null ? null : this.fromRedisValue(shortStats);
    console.log('UserCacheService.getShortStats', { userId, key, shortStats, value })
    return value
  }

  /** @param {number} userId @param {ShortStats} shortStats */
  async setShortStats(userId, shortStats) {
    const key = this.keys.shortStats(userId);
    const value = this.toRedisValue(shortStats)
    await this.redis.setEx(key, this.expirationTimeSeconds, value)
    console.log('UserCacheService.setShortStats', { userId, shortStats, key, value })
  }

  /** @param {ShortUserInfo | ShortStats} value @returns {string} */
  toRedisValue(value) {
    return JSON.stringify(value)
  }

  /** @template T @param {string} redisValue @returns {T} */
  fromRedisValue(redisValue) {
    return JSON.parse(redisValue)
  }
}
