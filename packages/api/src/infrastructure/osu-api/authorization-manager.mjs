export class OsuApiAuthorizationManager {
  constructor(osuApiClient, { clientId, clientSecret }) {
    this.api = osuApiClient
    this.api.setAuthorizationManager(this)
    this.tokenExpiresAt = 0
    this.accessToken = null

    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  isAuthorized() {
    return this.accessToken !== null && Date.now() < this.tokenExpiresAt
  }

  async ensureAuthorized() {
    if (this.isAuthorized())
      return

    await this.authorize()
  }

  async authorize() {
    const { accessToken, expiresIn } = await this.api.getToken(this.clientId, this.clientSecret)
    this.accessToken = accessToken
    this.tokenExpiresAt = Date.now() + (expiresIn * 1000)
  }

  enrichHeaders(requestInit) {
    requestInit.headers['Authorization'] = 'Bearer ' + this.accessToken
  }
}
