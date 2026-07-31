export class EnvironmentModeUnsupportedError extends Error {
  /**
   * @param {string | undefined} mode
   */
  constructor(mode) {
    super(EnvironmentModeUnsupportedError.getMessage(mode))
  }

  /**
   * @param {string | undefined} mode
   * @returns
   */
  static getMessage(mode) {
    return `Environment mode is not supported: ${mode ?? '<undefined>'}`
  }
}

export class EnvironmentVariableUndefinedError extends Error {
  /**
   * @param {string} key
   */
  constructor(key) {
    super(EnvironmentVariableUndefinedError.getMessage(key))
  }

  /**
   * @param {string} key
   * @returns {string}
   */
  static getMessage(key) {
    return `Environment variable is not defined: '${key}'`
  }
}
