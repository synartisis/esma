import http from 'http'
import { middleware, use } from './middleware.js'

export { use } from './middleware.js'


export function createServer() {
  const server = http.createServer(requestListener)
  server.use = use
  return server
}



async function requestListener(req, res) {
  req.originalUrl = req.url
  let result
  for await (const mdEntry of middleware) {
    if (mdEntry.test(req.url)) {
      result = await mdEntry.run(req, res, next)
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