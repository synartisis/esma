import { use } from './middleware.js'
import { router } from './router.js'
import { parseRequestBody } from './body-parser.js'


export function patchServer(httpServer) {
  httpServer.use = use
  Object.assign(httpServer, router)
}


export function patchRequest(req) {
  req.originalUrl = req.url
  req.params = {}
  req.query = {}
  req._body = null
  Object.defineProperty(req, 'body', {
    async get() {
      if (!req._body) req._body = await parseRequestBody(req)
      return req._body
    }
  })
}


export function setMiddlewareParams(req, { params, query }) {
  req.params = { ...params }
  req.query = { ...query }
}