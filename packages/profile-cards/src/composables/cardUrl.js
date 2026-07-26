const API_FALLBACK = 'http://localhost:3001'

export const IDENTIFIER_FALLBACK = {
  username: 'peppy',
  id: '2',
}

/** @param {string | undefined} envValue */
export function getApiBase(envValue) {
  return (envValue ?? API_FALLBACK).replace(/\/$/, '')
}

/**
 * @param {string} apiBase
 * @param {{ tab: string, identifier: string, size: string }} settings
 */
export function buildCardRequestUrl(apiBase, { tab, identifier, size }) {
  const identifierType = tab === 'username' ? 'username' : 'id'
  return `${apiBase}/api/players/${identifierType}/${encodeURIComponent(identifier)}/cards/${size}.svg`
}
