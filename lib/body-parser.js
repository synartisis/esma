import zlib from 'zlib'

const CONTENT_LENGTH_LIMIT = 100.000

export async function parseRequestBody(req) {
  const contentLength = req.headers['content-length']
  if (!contentLength || Number.parseInt(contentLength) > CONTENT_LENGTH_LIMIT) return null
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
  if (contentType === 'application/json') return json(buffer)
  if (contentType === 'application/x-www-form-urlencoded') return urlEncoded(buffer)
  return buffer
}


function json(buffer) {
  const json = buffer.toString()
  try {
    return JSON.parse(json)
  } catch (error) {
    return {}
  }
}


function urlEncoded(buffer) {
  const urlEncoded = buffer.toString()
  try {
    return Object.fromEntries(new URLSearchParams(urlEncoded))
  } catch (error) {
    return {}
  }
}