/**
 * @typedef {Object} esma.Settings
 *  @prop {string} env
 *  @prop {'weak' | 'strong'} etag
 *  @prop {number} bodyParserLimit
 */


/** @type {esma.Settings} */
export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
  bodyParserLimit: 100_000,
}


export function config(/** @type {esma.Settings} */userSettings) {
  Object.assign(settings, userSettings)
}
