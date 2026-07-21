const OSU_API_HOST = 'https://osu.ppy.sh'
const OSU_API_BASE_PATH = '/api/v2'

export class OsuApiClient {
  constructor() {
    this.authorizationManager = null
  }

  buildUri(path) {
    return new URL(OSU_API_BASE_PATH + path, OSU_API_HOST)
  }

  setAuthorizationManager(authorizationManager) {
    this.authorizationManager = authorizationManager
  }

  async getToken(clientId, clientSecret) {
    const requestUri = new URL('/oauth/token', OSU_API_HOST);
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
      })
    })

    if (response.status !== 200) {
      throw new Error('Failed to authenticate')
    }

    const responseBody = await response.json()
    return {
      accessToken: responseBody.access_token,
      expiresIn: responseBody.expires_in,
    }
  }

  async getUser(usernameOrId) {
    console.log('Authenticating')
    await this.authorizationManager.ensureAuthorized()
    console.log('Authenticated successfully!')
    const requestUri = this.buildUri(`/users/${usernameOrId}`)
    console.log('Request URI:', requestUri)
    const requestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }
    this.authorizationManager.enrichHeaders(requestInit)
    const response = await fetch(requestUri, requestInit)

    console.log('Fetch response', response.status, response.statusText, response.headers)

    const responseBody = await response.json()
    return responseBody
  }
}
