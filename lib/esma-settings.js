/** @typedef {import('esma').Settings} Settings */


/** @type {Settings} */
export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
  bodyParserLimit: 100_000,
  sessionCookieName: 'esma_session'
}


/** @param {Settings} userSettings */
export function config(userSettings) {
  if (!['weak', 'strong'].includes(userSettings.etag)) userSettings.etag = 'weak'
  if (!Number.isInteger(userSettings.bodyParserLimit)) userSettings.bodyParserLimit = 100_000
  if (typeof userSettings.sessionCookieName !== 'string') userSettings.sessionCookieName = 'esma_session'
  Object.assign(settings, userSettings)
}
