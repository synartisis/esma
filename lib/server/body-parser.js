import * as zlib from 'node:zlib'
import { HttpError } from './utils.js'


// /** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma/private').Context} Context */

/** @type {(req: esma.Request<unknown>, res: Response, ctx: Context) => Promise<any>} */
export async function parseRequestBody(req, res, ctx) {
  const contentLength = req.headers['content-length']
  if (contentLength && Number.parseInt(contentLength) > ctx.settings.bodyParserLimit) {
    throw new HttpError(413, 'Content Too Large', req, res)
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  let buffer = Buffer.concat(chunks)
  if (req.headers['content-encoding'] === 'br') {
    buffer = await new Promise((resolve, reject) => zlib.brotliDecompress(buffer, (err, buf) => err ? reject(err) : resolve(buf)))
  }
  if (req.headers['content-encoding'] === 'gzip') {
    buffer = await new Promise((resolve, reject) => zlib.unzip(buffer, (err, buf) => err ? reject(err) : resolve(buf)))
  }
  if (req.headers['content-encoding'] === 'deflate') {
    buffer = await new Promise((resolve, reject) => zlib.inflate(buffer, (err, buf) => err ? reject(err) : resolve(buf)))
  }
  const contentType = req.headers['content-type']?.split(';')[0].trim()
  if (contentType === 'application/json') {
    try {
      return JSON.parse(buffer.toString())
    } catch (error) {
      throw new HttpError(400, 'request body has not valid json content', req, res)
    }
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    try {
      return Object.fromEntries(new URLSearchParams(buffer.toString()))
    } catch (error) {
      throw new HttpError(400, 'request body has no valid "application/x-www-form-urlencoded" content', req, res)
    }
  }
  if (contentType?.split('/')[0] === 'text') return buffer.toString()
  return buffer
}
