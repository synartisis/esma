import http from 'http'
import { middleware, use } from './middleware.js'
import { router } from './router.js'
import { parseRequestBody } from './body-parser.js'
export {  static } from './static.js'

export { use } from './middleware.js'


export function createServer() {
  const server = http.createServer(requestListener)
  server.use = use
  Object.entries(router).forEach(([k,v]) => server[k] = v)
  server.get = router.get
  server.post = router.post
  return server
}



async function requestListener(req, res) {
  req.originalUrl = req.url

  req._body = null
  Object.defineProperty(req, 'body', {
    async get() {
      if (!req._body) req._body = await parseRequestBody(req)
      return req._body
    }
  })
  // console.debug(await req.body)

  let result
  for await (const mdEntry of middleware) {
    const match = mdEntry.match(req)
    // console.debug(mdEntry.path, req.url, {match})
    if (match) {
      Object.assign(req, match)
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
    console.warn(`[esmit] next() is not supported. Called at url: ${this.url}`)
  }
}

function finalHandler(req, res, result) {
  if (res.writableEnded) return
  if (!result) return res.writeHead(404).end()
  if (result instanceof Object) {
    const json = JSON.stringify(result)
    res.setHeader('Content-Type', 'application/json')
    return res.end(json)
    // if (result.body) {
    //   return res.end(result.body)
    // } else {
    //   const json = JSON.stringify(result)
    //   res.setHeader('Content-Type', 'application/json')
    //   return res.end(json)
    // }
  }
  return res.end(String(result))
}