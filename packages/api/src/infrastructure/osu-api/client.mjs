const OSU_API_HOST = 'https://osu.ppy.sh'
const OSU_API_BASE_PATH = '/api/v2'

/** @typedef {{ accessToken: string, expiresIn: number }} AccessToken */
/** @typedef {{ ensureAuthorized(): Promise<void>, enrichHeaders(request: RequestInit): void }} AuthorizationManager */

export class OsuApiClient {
  constructor() {
    this.authorizationManager = null
  }

  /** @param {string} path */
  buildUri(path) {
    return new URL(OSU_API_BASE_PATH + path, OSU_API_HOST)
  }

  /** @param {AuthorizationManager} authorizationManager */
  setAuthorizationManager(authorizationManager) {
    this.authorizationManager = authorizationManager
  }

  /** @param {string | undefined} clientId @param {string | undefined} clientSecret @returns {Promise<AccessToken>} */
  async getToken(clientId, clientSecret) {
    const requestUri = new URL('/oauth/token', OSU_API_HOST)
    const response = await fetch(requestUri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'public',
      }),
    })

    if (response.status !== 200) {
      throw new Error('Failed to authenticate')
    }

    /** @type {{ access_token: string, expires_in: number }} */
    const responseBody = await response.json()
    return {
      accessToken: responseBody.access_token,
      expiresIn: responseBody.expires_in,
    }
  }

  /** @param {string | number} usernameOrId @returns {Promise<unknown>} */
  async getUser(usernameOrId) {
    console.log('Authenticating')
    if (!this.authorizationManager)
      throw new Error('Authorization manager is not configured')
    await this.authorizationManager.ensureAuthorized()
    console.log('Authenticated successfully!')
    const requestUri = this.buildUri(`/users/${usernameOrId}`)
    console.log('Request URI:', requestUri)
    /** @type {RequestInit} */
    const requestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
    this.authorizationManager.enrichHeaders(requestInit)
    const response = await fetch(requestUri, requestInit)

    console.log(
      'Fetch response',
      response.status,
      response.statusText,
      response.headers,
    )

    const responseBody = await response.json()
    return responseBody
  }
}
