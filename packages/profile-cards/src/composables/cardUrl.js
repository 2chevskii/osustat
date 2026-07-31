export const IDENTIFIER_FALLBACK = {
  username: 'peppy',
  id: '2',
}

/** @param {string | undefined} envValue */
export function getApiBase(envValue) {
  if (envValue === undefined) throw new Error('VITE_API_URL is not defined')
  return envValue.replace(/\/$/, '')
}

/**
 * @param {string} apiBase
 * @param {{ tab: string, identifier: string, size: string }} settings
 */
export function buildCardRequestUrl(apiBase, { tab, identifier, size }) {
  const identifierType = tab === 'username' ? 'username' : 'id'
  return `${apiBase}/api/players/${identifierType}/${encodeURIComponent(identifier)}/cards/${size}.svg`
}
