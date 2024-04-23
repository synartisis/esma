import * as crypto from 'crypto'
import * as fs from 'fs'
import { settings } from '../esma-settings.js'


/** @type {(entity: any, kind?: 'weak' | 'strong') => string | null} */
export function getEtag(entity, kind) {
  if (!kind) kind = settings.etag
  if(entity instanceof fs.Stats) {
    const mtime = entity.mtime.getTime().toString(16)
    const size = entity.size.toString(16)
    return `"${size}-${mtime}"`
  }
  if (entity.length === 0) return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  const hash = crypto
    .createHash('sha1')
    .update(entity, 'utf8')
    .digest('base64')
    .substring(0, 27)
  if (kind === 'weak') return `W/"${hash}"`
  if (kind === 'strong') return `"${hash}"`
  return null
}


export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {esma.Request} req
   * @param {esma.Response} res
   */
  constructor(statusCode, message, req, res) {
    super(`HTTP ${statusCode} - ${message}`)
    if (statusCode === 401 && !!settings.authorizationUrl) res.redirect(`${settings.authorizationUrl}?redirectUrl=${encodeURIComponent(req.originalUrl)}`)
    this.statusCode = statusCode
    this.req = req
    this.res = res
  }
}