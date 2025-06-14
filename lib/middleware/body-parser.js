/** @import * as esma from 'esma' */
import * as zlib from 'node:zlib'
import { HttpError } from '../utils.js'


/** @type {(req: esma.Request, res: esma.Response, ctx: types.Context) => Promise<Record<string, unknown> | string | Buffer>} */
export async function parseRequestBody(req, res, ctx) {
  const contentLength = req.headers['content-length']
  if (contentLength && Number.parseInt(contentLength) > ctx.settings.bodyParserLimit) {
    throw new HttpError(413, 'Content Too Large')
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  let buffer = Buffer.concat(chunks)
  if (req.headers['content-encoding'] === 'br') {
    buffer = await new Promise((resolve, reject) => zlib.brotliDecompress(buffer, (err, buf) => err ? reject(err) : resolve(Buffer.from(buf))))
  }
  if (req.headers['content-encoding'] === 'gzip') {
    buffer = await new Promise((resolve, reject) => zlib.unzip(buffer, (err, buf) => err ? reject(err) : resolve(Buffer.from(buf))))
  }
  if (req.headers['content-encoding'] === 'deflate') {
    buffer = await new Promise((resolve, reject) => zlib.inflate(buffer, (err, buf) => err ? reject(err) : resolve(Buffer.from(buf))))
  }
  const contentType = req.headers['content-type']?.split(';')[0].trim()
  if (contentType === 'application/json') {
    try {
      return JSON.parse(buffer.toString())
    } catch (error) {
      throw new HttpError(400, 'request body has not valid json content')
    }
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    try {
      return Object.fromEntries(new URLSearchParams(buffer.toString()))
    } catch (error) {
      throw new HttpError(400, 'request body has no valid "application/x-www-form-urlencoded" content')
    }
  }
  if (contentType?.split('/')[0] === 'text') return buffer.toString()
  return buffer
}
