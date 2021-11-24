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
  for await (const mdEntry of middleware) {
    // console.log(req.url, {mdEntry})
    if (!mdEntry.test(req.url)) continue
    // if (!!mdEntry.path && !req.url.startsWith(mdEntry.path)) continue
    const { handlers } = mdEntry
    for await (const handler of handlers) {
      result = await handler(req, res, next)
      // console.log({handler, result})
      if (result?.http) {
        const { statusCode, headers } = result.http
        if (statusCode) res.statusCode = statusCode
        if (headers) {
          Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
        }
        delete result.http
      }
      if (result || res.writableEnded) break
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
      return res.end(result.body)
    } else {
      const json = JSON.stringify(result)
      res.setHeader('Content-Type', 'application/json')
      return res.end(json)
    }
  }
  return res.end(String(result))
}