export const settings = {
  env: process.env.NODE_ENV || 'development',
  etag: 'weak',
}


export function setSetting(name, value) {
  settings[name] = value
}