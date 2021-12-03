export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
}


export function config(userSettings) {
  Object.assign(settings, userSettings)
}
