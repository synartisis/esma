import http from 'http'
import { middleware, use } from './middleware.js'

export { use } from './middleware.js'


export function createServer() {
  const server = http.createServer(requestListener)
  server.use = use
  return server
}



async function requestListener(req, res) {
  let result
  for await (const md of middleware) {
    console.log(res.headersSent)
    result = await md.fn(req, res, next)
    if (result?.http) {
      const { statusCode, headers } = result.http
      if (statusCode) res.statusCode = statusCode
      console.log('***', res.headers)
      if (headers) {
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
      }

      delete result.http
    }
    if (result || res.writableEnded) break
  }
  finalHandler(req, res, result)
}

function next() {
  return
}

function finalHandler(req, res, result) {
  if (res.writableEnded) return
  if (!result) return res.writeHead(404).end()
  if (result instanceof Object) {
    if (result.body) {
      res.end(result.body)
    } else {
      const json = JSON.stringify(result)
      res.setHeader('Content-Type', 'application/json')
      return res.end(json)
    }
  }
}