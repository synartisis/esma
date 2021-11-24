import http from 'http'
import { middleware, use } from './middleware.js'
import { router } from './router.js'
export {  static } from './static.js'

export { use } from './middleware.js'


import {URLPattern} from './deps/urlpattern.js'


let p = new URLPattern({ pathname: '/foo/:name' });

let r = p.exec('https://example.com/foo/bar?q1=1')
console.log(r);



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
  let result
  for await (const mdEntry of middleware) {
    if (mdEntry.test(req)) {
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