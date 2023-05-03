/** @typedef {import('./types.js').esma.Settings} esma.Settings */


/** @type {esma.Settings} */
export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
  bodyParserLimit: 100_000,
}


/** @param {esma.Settings} userSettings */
export function config(userSettings) {
  if (!['weak', 'strong'].includes(userSettings.etag)) userSettings.etag = 'weak'
  if (!Number.isInteger(userSettings.bodyParserLimit)) userSettings.bodyParserLimit = 100_000
  Object.assign(settings, userSettings)
}
