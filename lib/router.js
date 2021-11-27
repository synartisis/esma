import { URLPattern } from './deps/urlpattern.js'
import * as httpPatch from './http-patch.js'

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'head', 'options', 'trace', 'patch', 'all']

export const mainRouter = router()


export function router() {
  const r = {

    type: 'router',
    middleware: [],

    use(path, ...handlers) {
      if (typeof path !== 'string') {
        handlers = [ path, ...handlers ]
        path = '/'
      }
      const mdEntry = createMiddlewareEntry(path, handlers, { mounting: true })
      this.middleware.push(mdEntry)
    },

    async handleRequest(req, res) {
      let result
      for await (const mdlEntry of this.middleware) {
        result = await mdlEntry.applyHandlers(req, res, next.bind(req))
        if (result || res.writableEnded) break
      }
      return result
    },

    setHttpMethodHandler(method) {
      this[method] = function(path, ...handlers) {
        if (typeof path !== 'string') throw TypeError(`esma router: 'path' must be a string`)
        const mdEntry = createMiddlewareEntry(path, handlers, { method, mounting: false, mountpath: path })
        this.middleware.push(mdEntry)
      }
    },

    toJSON() {
      return {
        type: this.type,
        middleware: this.middleware.map(m => ({
          path: m.path,
          method: m.method,
          handlers: m.handlers.map(h => typeof h === 'function' ? h.toString().substring(0, 40) : h),
        })),
      }
    },

  }
  HTTP_METHODS.forEach(method => r.setHttpMethodHandler(method))

  return r
}







function createMiddlewareEntry(path, handlers, { method = '*', mounting = false }) {
  if (method === 'all') method = '*'
  const pathPattern = mounting ? path + '*' : path
  const rePattern = new URLPattern({ pathname: pathPattern })
  // console.debug('-', method, path, handlers.length, rePattern)

  const mdlEntry = {
    path,
    method,
    handlers,
    rePattern,

    async applyHandlers(req, res, next) {
      if (method !== '*' && req.method.toLowerCase() !== method) return null
      const match = this.rePattern.exec({ pathname: req.url })
      // console.debug('--', match, this.rePattern.pattern.pathname)
      if (!match) return null

      let reqData = { params: {}, query: {} }
      if (match.pathname.groups) reqData.params = {...match.pathname.groups}
      reqData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
      httpPatch.setRequestData(req, reqData)
      // console.debug('-', mdlEntry.path, req.url, req.originalUrl, { reqParams }, mdlEntry.handlers[0].toString().substring(0,40))

      let result
      try {
        let oldReqUrl = req.url
        let oldBaseUrl = req.baseUrl
        if (mounting) {
          if (this.path !== '/') {
            req.url = req.originalUrl.replace(this.path, '') ?? '/'
            if (!req.url.startsWith('/')) req.url = '/' + req.url
            req.baseUrl = this.path
          }
        }
        for await (const handler of this.handlers) {
          if (handler.type === 'router') {
            result = await handler.handleRequest(req, res, next)
          }
          if (typeof handler === 'function') {
            result = await handler(req, res, next)
          }
          if (result || res.writableEnded) break
        }
        req.url = oldReqUrl       // reset
        req.baseUrl = oldBaseUrl  // reset
      } catch (error) {
        result = { http: { statusCode: 500, body: error.stack || error.message || error } }
      }
      return result
    },

  }

  return mdlEntry
}


function next(err) {
  if (err instanceof Error) {
    throw err
  } else {
    console.warn(`[esma] next() is not supported. Called at url: ${this.url}`)
  }
}
