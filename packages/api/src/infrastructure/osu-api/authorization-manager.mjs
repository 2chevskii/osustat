/** @typedef {{ clientId?: string | undefined, clientSecret?: string | undefined }} OsuApiCredentials */

export class OsuApiAuthorizationManager {
  /** @param {import('./client.mjs').OsuApiClient} osuApiClient @param {OsuApiCredentials} credentials */
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
    if (this.isAuthorized()) return

    await this.authorize()
  }

  async authorize() {
    const { accessToken, expiresIn } = await this.api.getToken(
      this.clientId,
      this.clientSecret,
    )
    this.accessToken = accessToken
    this.tokenExpiresAt = Date.now() + expiresIn * 1000
  }

  /** @param {RequestInit} requestInit */
  enrichHeaders(requestInit) {
    if (!this.accessToken) throw new Error('Access token is missing')
    const headers = new Headers(requestInit.headers)
    headers.set('Authorization', 'Bearer ' + this.accessToken)
    requestInit.headers = headers
  }
}
