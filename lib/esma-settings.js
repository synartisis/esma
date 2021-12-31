/** @type {esma.Settings} */
export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
  bodyParserLimit: 100_000,
}


export function config(/** @type {esma.Settings} */userSettings) {
  if (!['weak', 'strong'].includes(userSettings.etag)) userSettings.etag = 'weak'
  if (!Number.isInteger(userSettings.bodyParserLimit)) userSettings.bodyParserLimit = 100_000
  Object.assign(settings, userSettings)
}
