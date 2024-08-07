/** @import * as esma from 'esma' */


/** @type {esma.Settings} */
export const settings = {
  env: process.env.NODE_ENV ?? 'development',
  etag: 'strong',
  bodyParserLimit: 100_000,
  sessionCookieName: 'esma_session',
  authorizationUrl: '',
}


/** @param {Partial<esma.Settings>} userSettings */
export function config(userSettings = {}) {
  if (!userSettings.etag || !['weak', 'strong'].includes(userSettings.etag)) userSettings.etag = 'strong'
  if (!Number.isInteger(userSettings.bodyParserLimit)) userSettings.bodyParserLimit = 100_000
  if (typeof userSettings.sessionCookieName !== 'string') userSettings.sessionCookieName = 'esma_session'
  Object.assign(settings, userSettings)
}
