import http from 'http'
import { middleware } from './middleware.js'
import * as httpPatch from './http-patch.js'

export { use } from './middleware.js'
export { static } from './static.js'


export function createServer() {
  const httpServer = http.createServer(requestListener)
  httpPatch.patchServer(httpServer)
  return httpServer
}



async function requestListener(req, res) {
  httpPatch.patchRequest(req)
  // console.debug(await req.body)

  let result
  for await (const mdEntry of middleware) {
    const match = mdEntry.match(req)
    // console.debug(mdEntry.path, req.url, {match})
    if (match) {
      httpPatch.setMiddlewareParams(req, match)
      try {
        result = await mdEntry.run(req, res, next.bind(req))
      } catch (error) {
        console.error(error)
        res.statusCode = 500
        return res.end(error.stack || error.message || error)
      }
    }
    if (result || res.writableEnded) break
  }
  finalHandler(req, res, result)
}

function next(err) {
  if (err instanceof Error) {
    throw err
  } else {
    console.warn(`[esma] next() is not supported. Called at url: ${this.url}`)
  }
}

function finalHandler(req, res, result) {
  if (res.writableEnded) return
  if (!result) return res.writeHead(404).end()
  if (result instanceof Object) {
    const json = JSON.stringify(result)
    res.setHeader('Content-Type', 'application/json')
    return res.end(json)
  }
  return res.end(String(result))
}