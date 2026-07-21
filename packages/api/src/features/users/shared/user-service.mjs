export class UserService {
  constructor(osuApiClient) {
    this.api = osuApiClient
  }

  async getById(userId) {
    const user = await this.api.getUser(userId)
    return user
  }

  async getByUsername(username) {
    const user = await this.api.getUser(this.toCanonicalUsername(username))
    return user
  }

  toCanonicalUsername(username) {
    const canonicalUsername = `@${username}`
    return canonicalUsername
  }
}
