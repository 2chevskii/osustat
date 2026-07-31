import { EnvironmentVariableUndefinedError } from './errors.mjs'

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {string} key
 * @returns {string}
 */
export function getRequiredEnv(env, key) {
  const value = env[key]
  if (typeof value === 'undefined')
    throw new EnvironmentVariableUndefinedError(key)

  return value
}
