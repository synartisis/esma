import { URLPattern } from '../deps/urlpattern.js'
import { createNext } from './express-compat.js'

/** @typedef {import('../types.js').esma.Router} esma.Router */
/** @typedef {import('../types.js').esma.Request} esma.Request */
/** @typedef {import('../types.js').esma.Handler} esma.Handler */
/** @typedef {import('../types.js').esma.Middleware} esma.Middleware */
/** @typedef {import('../types.js').esma.ErrorHandler} esma.ErrorHandler */

export const mainRouter = router()
/** @type {esma.ErrorHandler[]} */
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
      const pathWithoutTrailingSlash = path !== '/' && path.endsWith('/') ? path.substring(0, path.length - 1) : path
      const mdlEntry = createMiddlewareEntry(pathWithoutTrailingSlash, handlers, { router: this, mounting: true, mountpath: pathWithoutTrailingSlash })
      this.middleware.push(mdlEntry)
    },

    async handleRequest(req, res, ctx) {
      let result
      for await (const mdlEntry of this.middleware) {
        result = await mdlEntry.applyHandlers(req, res, ctx)
        if (result !== undefined || res.writableEnded) break
      }
      return result
    },

    ['get'](path, ...handlers) { this._method('get', path, handlers) },
    ['post'](path, ...handlers) { this._method('post', path, handlers) },
    ['put'](path, ...handlers) { this._method('put', path, handlers) },
    ['delete'](path, ...handlers) { this._method('delete', path, handlers) },
    ['head'](path, ...handlers) { this._method('head', path, handlers) },
    ['options'](path, ...handlers) { this._method('options', path, handlers) },
    ['trace'](path, ...handlers) { this._method('trace', path, handlers) },
    ['patch'](path, ...handlers) { this._method('patch', path, handlers) },
    ['all'](path, ...handlers) { this._method('all', path, handlers) },

    _method(method, path, handlers) {
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






/** @type {(path: string, handlers: esma.Handler[], options: any) => esma.Middleware} */
function createMiddlewareEntry(path, handlers, { method = '*', router, mounting = false, mountpath }) {
  if (method === 'all') method = '*'
  const pathPattern = mounting ? `${path === '/' ? '/*' : path + '{/*}?'}` : path
  const urlPattern = new URLPattern({ pathname: pathPattern })
  handlers.forEach(h => {
    // @ts-ignore - if h.length === 4, h works as an express error handler
    if (typeof h === 'function' && h.length === 4) errorStack.push(h)
    if (typeof h === 'object') h.mountpath = mountpath
  })
  // console.debug('-', method, path, handlers.length, urlPattern)

  /** @type {esma.Middleware} */
  const mdlEntry = {
    path,
    method,
    handlers,
    router,
    urlPattern,

    async applyHandlers(req, res, ctx) {
      if (!methodAllowed(req, method)) return
      const match = this.urlPattern.exec({ pathname: req.url })
      // console.debug('--', match, this.urlPattern.pattern.pathname)
      if (!match) return

      let reqData = { params: {}, query: {} }
      if (match.pathname.groups) reqData.params = {...match.pathname.groups}
      reqData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
      setRequestData(req, reqData)

      let oldReqUrl
      let oldBaseUrl = req.baseUrl = this.router.mountpath
      if (mounting) {
        if (this.path !== '/') {
          oldReqUrl = req.url
          req.url = req.originalUrl.replace(this.path, '') ?? '/'
          if (!req.url.startsWith('/')) req.url = '/' + req.url
          req.baseUrl = this.path
        }
      }
      let result
      for await (const handler of this.handlers) {
        ctx.express_action = null
        ctx.express_result = null
        if (typeof handler === 'object') {
          result = await handler.handleRequest(req, res, ctx)
        }
        if (typeof handler === 'function') {
          if (handler.length === 4) continue  // ignore error handler
          try {
            result = await handler(req, res, createNext(ctx))
          } catch (/** @type {any} */error) {
            result = { $statusCode: 500, $body: error?.stack || error?.message || error, $error: error }
          }
          if (ctx.express_action === 'route') break
          if (ctx.express_action === 'router') return
          if (ctx.express_action === 'send') return ctx.express_result
        }
        if (result !== undefined || res.writableEnded) break
      }
      if (oldReqUrl) req.url = oldReqUrl       // reset
      req.baseUrl = oldBaseUrl  // reset
      return result
    },

  }

  return mdlEntry
}


/** @type {(req: esma.Request, method: string) => boolean} */
function methodAllowed(req, method) {
  const reqMethod = req.method?.toLowerCase() ?? ''
  if (method === '*') return true
  if (method === 'get' && ['get', 'head'].includes(reqMethod)) return true
  if (method === reqMethod) return true
  return false
}



/** @type {(req: esma.Request, reqData: any) => void} */
function setRequestData(req, { params, query }) {
  req.params = { ...params }
  req.query = { ...query }
}
