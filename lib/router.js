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
        const match = mdlEntry.match(req)
        // console.debug('-', mdlEntry.path, req.url, {match})
        if (match) {
          httpPatch.setMiddlewareParams(req, match)
          try {
            result = await mdlEntry.run(req, res, next.bind(req))
          } catch (error) {
            result = { http: { statusCode: 500, body: error.stack || error.message || error } }
          }
        }
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

    match(req) {
      if (method !== '*' && req.method.toLowerCase() !== method) return false
      let result = { params: {}, query: {} }
      const match = this.rePattern.exec({ pathname: req.url })
      // console.debug('--', match, this.rePattern.pattern.pathname)
      if (match) {
        if (match.pathname.groups) result.params = {...match.pathname.groups}
        result.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
        return result
      }
      return false
    },

    async run(req, res, next) {
      if (mounting) {
        if (this.path !== '/') {
          req.url = req.originalUrl.replace(this.path, '') ?? '/'
          if (!req.url.startsWith('/')) req.url = '/' + req.url
          req.baseUrl = this.path
        }
      }

      let result
      for await (const handler of this.handlers) {
        if (handler.type === 'router') {
          result = await handler.handleRequest(req, res, next)
        }
        if (typeof handler === 'function') {
          result = await handler(req, res, next)
        }
        if (result || res.writableEnded) break
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
