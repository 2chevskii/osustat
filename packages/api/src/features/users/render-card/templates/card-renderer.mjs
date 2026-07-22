import { Resvg } from '@resvg/resvg-js'
import { CardTemplateProvider } from './card-template-provider.mjs'

/** @typedef {import('../../shared/user-cache-service.mjs').ShortStats} ShortStats */
/** @typedef {import('../../shared/user-cache-service.mjs').ShortUserInfo} ShortUserInfo */

export class CardRenderer {
  /** @param {CardTemplateProvider} templateProvider */
  constructor(templateProvider) {
    this.templateProvider = templateProvider
  }

  /** @param {ShortStats} shortStats @param {ShortUserInfo} shortUserInfo @returns {Promise<string>} */
  async renderCompact(shortStats, shortUserInfo) {
    const template = await this.templateProvider.get('compact')
    const svg = template({
      global_rank: shortStats.rank,
      pp_count: shortStats.pp,
      username: shortUserInfo.username,
      avatar_url: shortUserInfo.avatarUrl,
    })
    return svg
  }

  /** @param {ShortStats} shortStats @param {ShortUserInfo} shortUserInfo @returns {Promise<string>} */
  async renderFull(shortStats, shortUserInfo) {
    const template = await this.templateProvider.get('full')
    return template({
      username: shortUserInfo.username,
      avatar_url: shortUserInfo.avatarUrl,
      pp_count: formatNumber(shortStats.pp),
      global_rank: formatNumber(shortStats.rank),
      country_rank: formatNumber(shortStats.countryRank),
      play_time_hours: formatNumber(Math.floor(shortStats.playTime / 3600)),
      play_count: formatNumber(shortStats.playCount),
      level: formatNumber(shortStats.level),
      accuracy: Number(shortStats.accuracy).toFixed(2),
      ranked_score: formatNumber(shortStats.rankedScore),
      total_score: formatNumber(shortStats.totalScore),
      follower_count: formatNumber(shortUserInfo.followerCount),
      highest_rank: formatNumber(shortStats.highestRank),
      joined_at: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(shortUserInfo.joinedAt)),
    })
  }

  /** @param {string} svg */
  renderPng(svg) {
    return new Resvg(svg).render().asPng()
  }
}

/** @param {number | undefined} value */
function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}
