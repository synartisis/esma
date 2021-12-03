export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
  bodyParserLimit: 100_000,
}


export function config(userSettings) {
  Object.assign(settings, userSettings)
}
