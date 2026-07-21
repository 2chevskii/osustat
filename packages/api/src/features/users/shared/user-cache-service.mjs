export class UserCacheService {
  /**
   * @param {ReturnType<import('redis').createClient>} redisClient
   */
  constructor(redisClient, expirationTimeSeconds = 30) {
    this.redis = redisClient
    this.expirationTimeSeconds = expirationTimeSeconds
  }

  get keys() {
    return {
      id: username => `userid_lookup:${username}`,
      shortInfo: userId => `user.info.short:${userId}`,
      shortStats: userId => `user.stats.short:${userId}`
    }
  }

  async getId(username) {
    const key = this.keys.id(username);
    const strId = await this.redis.get(key);
    const id = parseInt(strId)
    console.log('UserCacheService.getId', { key, strId, id })
    return Number.isNaN(id) ? null : id
  }

  async setId(username, userId) {
    const key = this.keys.id(username)
    await this.redis.setEx(key, this.expirationTimeSeconds, username)
    console.log('UserCacheService.setId', { username, userId, key, expirationTimeSeconds: this.expirationTimeSeconds, username })
  }

  async getShortInfo(userId) {
    const key = this.keys.shortInfo(userId)
    const shortInfo = await this.redis.get(key)
    const value = shortInfo === null ? null : this.fromRedisValue(shortInfo)
    console.log('UserCacheService.getShortInfo', { userId, key, shortInfo, value })
    return value;
  }

  async setShortInfo(userId, shortInfo) {
    const key = this.keys.shortInfo(userId);
    const value = this.toRedisValue(shortInfo)
    await this.redis.setEx(key, this.expirationTimeSeconds, value)
    console.log('UserCacheService.setShortInfo', { userId, key, expirationTimeSeconds: this.expirationTimeSeconds, shortInfo, value })
  }

  async getShortStats(userId) {
    const key = this.keys.shortStats(userId);
    const shortStats = await this.redis.get(key)
    const value = shortStats === null ? null : this.fromRedisValue(shortStats);
    console.log('UserCacheService.getShortStats', { userId, key, shortStats, value })
    return value
  }

  async setShortStats(userId, shortStats) {
    const key = this.keys.shortStats(userId);
    const value = this.toRedisValue(shortStats)
    await this.redis.setEx(key, this.expirationTimeSeconds, value)
    console.log('UserCacheService.setShortStats', { userId, shortStats, key, value })
  }

  toRedisValue(value) {
    return JSON.stringify(value)
  }

  fromRedisValue(redisValue) {
    return JSON.parse(redisValue)
  }
}
