/** @import * as esma from 'esma' */
import * as crypto from 'crypto'
import * as fs from 'fs'
import { settings } from './esma-settings.js'


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
   * esma Error object to be thrown inside Handlers
   * @param {keyof typeof httpErrorStatusCodes} statusCode http error status code
   * @param {string} [message] error message, if not defined the standard message for the status code will be included
   * @example
   * server.get('/a-path', req => {
   *   if (missingArgument) throw new esma.HttpError(400, 'an argument is missing')
   * })
   */
  constructor(statusCode, message) {
    if (!httpErrorStatusCodes[statusCode]) {
      super(`HTTP statusCode "${statusCode}" does not exist`)
      this.statusCode = 500
    } else {
      super(`HTTP ${statusCode} - ${message ?? httpErrorStatusCodes[statusCode]}`)
      this.statusCode = statusCode
    }
  }
}


const httpErrorStatusCodes = /** @type {const} */({
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a Teapot',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
})

const httpStatusCodes = /** @type {const} */({
  100: 'Continue',
  101: 'Switching protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found (Previously "Moved Temporarily")',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: 'Switch Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  ...httpErrorStatusCodes,
})

