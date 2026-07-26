/** @typedef {'username' | 'userid'} FormTab */
/** @typedef {'compact' | 'full'} CardSize */
/** @typedef {{ tab: FormTab, size: CardSize, username: string, userId: string }} FormSettings */

/** @type {FormSettings} */
export const DEFAULT_FORM_SETTINGS = {
  tab: 'username',
  size: 'full',
  username: '',
  userId: '',
}

const VALID_TABS = new Set(['username', 'userid'])
const VALID_SIZES = new Set(['compact', 'full'])

/**
 * @param {string} [search]
 * @returns {FormSettings}
 */
export function parseFormStateFromSearch(search = '') {
  const query = new URLSearchParams(search)
  const tab = query.get('tab')
  const size = query.get('size')

  return {
    tab: tab && VALID_TABS.has(tab) ? /** @type {FormTab} */ (tab) : DEFAULT_FORM_SETTINGS.tab,
    username: query.get('username') ?? DEFAULT_FORM_SETTINGS.username,
    userId: query.get('userId') ?? DEFAULT_FORM_SETTINGS.userId,
    size: size && VALID_SIZES.has(size) ? /** @type {CardSize} */ (size) : DEFAULT_FORM_SETTINGS.size,
  }
}

/**
 * @param {FormSettings} settings
 * @param {string} [currentSearch]
 */
export function createFormQueryString({ tab, username, userId, size }, currentSearch = '') {
  const query = new URLSearchParams(currentSearch)

  if (tab && tab !== DEFAULT_FORM_SETTINGS.tab) query.set('tab', tab)
  if (username) query.set('username', username)
  if (userId) query.set('userId', userId)
  if (size && size !== DEFAULT_FORM_SETTINGS.size) query.set('size', size)

  return query.toString()
}
