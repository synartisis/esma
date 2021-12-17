import { URLPattern } from '../deps/urlpattern.js'
import { createNext } from './express-compat.js'

// const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'head', 'options', 'trace', 'patch', 'all']

export const mainRouter = router()
export const errorStack = []


export function router() {
  /** @type {esma.Router} */
  const r = {

    type: 'router',
    mountpath: '/',
    middleware: [],

    use(path, ...handlers) {
      if (typeof path !== 'string') {
        handlers = [ path, ...handlers ]
        path = '/'
      }
      const mdlEntry = createMiddlewareEntry(path, handlers, { router: this, mounting: true, mountpath: path })
      this.middleware.push(mdlEntry)
    },

    async handleRequest(req, res, ctx) {
      let result
      for await (const mdlEntry of this.middleware) {
        result = await mdlEntry.applyHandlers(req, res, ctx)
        if (result || res.writableEnded) break
      }
      return result
    },

    ['get'](path, ...handlers) { this.METHOD('get', path, handlers) },
    ['post'](path, ...handlers) { this.METHOD('post', path, handlers) },
    ['put'](path, ...handlers) { this.METHOD('put', path, handlers) },
    ['delete'](path, ...handlers) { this.METHOD('delete', path, handlers) },
    ['head'](path, ...handlers) { this.METHOD('head', path, handlers) },
    ['options'](path, ...handlers) { this.METHOD('options', path, handlers) },
    ['trace'](path, ...handlers) { this.METHOD('trace', path, handlers) },
    ['patch'](path, ...handlers) { this.METHOD('patch', path, handlers) },
    ['all'](path, ...handlers) { this.METHOD('all', path, handlers) },

    METHOD(method, path, handlers) {
      if (typeof path !== 'string') return // do not add handler if path is missing
      const mdEntry = createMiddlewareEntry(path, handlers, { method, router: this, mounting: false, mountpath: path })
      this.middleware.push(mdEntry)
    },

    onerror(errorHandler) {
      errorStack.push(errorHandler)
    },

    toJSON() {
      return {
        type: this.type,
        middleware: this.middleware.map(m => ({
          path: m.path,
          method: m.method,
          handlers: m.handlers.map(h => typeof h === 'function' ? h.toString().substring(0, 40) : h),
          router: `{ mountpath: '${m.router.mountpath}' }`,
        })),
      }
    },

  }

  return r
}







function createMiddlewareEntry(path, handlers, { method = '*', router, mounting = false, mountpath }) {
  if (method === 'all') method = '*'
  const pathPattern = mounting ? path + '*' : path
  const urlPattern = new URLPattern({ pathname: pathPattern })
  handlers.filter(h => h.type === 'router').forEach(h => h.mountpath = mountpath)
  handlers.filter(h => h.length === 4).forEach(h => errorStack.push(h))
  // console.debug('-', method, path, handlers.length, urlPattern)

  /** @type {esma.Middleware} */
  const mdlEntry = {
    path,
    method,
    handlers,
    router,
    urlPattern,

    async applyHandlers(req, res, ctx) {
      if (!methodAllowed(req, method)) return null
      const match = this.urlPattern.exec({ pathname: req.url })
      // console.debug('--', match, this.urlPattern.pattern.pathname)
      if (!match) return null

      let reqData = { params: {}, query: {} }
      if (match.pathname.groups) reqData.params = {...match.pathname.groups}
      reqData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
      setRequestData(req, reqData)

      let oldReqUrl = req.url
      let oldBaseUrl = req.baseUrl = this.router.mountpath
      if (mounting) {
        if (this.path !== '/') {
          req.url = req.originalUrl.replace(this.path, '') ?? '/'
          if (!req.url.startsWith('/')) req.url = '/' + req.url
          req.baseUrl = this.path
        }
      }
      let result
      for await (const handler of this.handlers) {
        ctx.express_action = null
        ctx.express_result = null
        if ('type' in handler && handler.type === 'router') {
          result = await handler.handleRequest(req, res, ctx)
        }
        if (typeof handler === 'function') {
          if (handler.length === 4) continue  // ignore error handler
          try {
            result = await handler(req, res, createNext(ctx))
          } catch (error) {
            result = { $statusCode: 500, $body: error?.stack || error?.message || error, $error: error }
          }
          if (ctx.express_action === 'route') break
          if (ctx.express_action === 'router') return
          if (ctx.express_action === 'send') return ctx.express_result
        }
        if (result || res.writableEnded) break
      }
      req.url = oldReqUrl       // reset
      req.baseUrl = oldBaseUrl  // reset
      return result
    },

  }

  return mdlEntry
}


function methodAllowed(req, method) {
  const reqMethod = req.method.toLowerCase()
  if (method === '*') return true
  if (method === 'get' && ['get', 'head'].includes(reqMethod)) return true
  if (method === reqMethod) return true
  return false
}



function setRequestData(req, { params, query }) {
  req.params = { ...params }
  req.query = { ...query }
}
