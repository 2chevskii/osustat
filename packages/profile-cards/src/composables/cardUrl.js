const API_FALLBACK = 'http://localhost:3001'

export const IDENTIFIER_FALLBACK = {
  username: 'peppy',
  id: '2',
}

export function getApiBase(envValue) {
  return (envValue ?? API_FALLBACK).replace(/\/$/, '')
}

export function buildCardRequestUrl(apiBase, { tab, identifier, size }) {
  const identifierType = tab === 'username' ? 'username' : 'id'
  return `${apiBase}/api/players/${identifierType}/${encodeURIComponent(identifier)}/cards/${size}.svg`
}
