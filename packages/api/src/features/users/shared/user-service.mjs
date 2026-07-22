/**
 * @typedef {{
 *   id: number, username: string, avatar_url: string, follower_count: number, join_date: string, is_supporter: boolean, country_code: string,
 *   statistics: { global_rank: number, country_rank: number, pp: number, ranked_score: number,
 *     total_score: number, play_count: number, play_time: number, level: { current: number },
 *     rank_highest?: { rank: number }, hit_accuracy?: number, accuracy?: number }
 * }} OsuUser
 */

export class UserService {
  /** @param {import('../../../infrastructure/osu-api/client.mjs').OsuApiClient} osuApiClient */
  constructor(osuApiClient) {
    this.api = osuApiClient
  }

  /** @param {number} userId @returns {Promise<OsuUser>} */
  async getById(userId) {
    const user = await this.api.getUser(userId)
    return /** @type {OsuUser} */ (user)
  }

  /** @param {string} username @returns {Promise<OsuUser>} */
  async getByUsername(username) {
    const user = await this.api.getUser(this.toCanonicalUsername(username))
    return /** @type {OsuUser} */ (user)
  }

  /** @param {string} username @returns {string} */
  toCanonicalUsername(username) {
    const canonicalUsername = `@${username}`
    return canonicalUsername
  }
}
