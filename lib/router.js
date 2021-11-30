import { URLPattern } from './deps/urlpattern.js'
import * as httpPatch from './http-patch.js'

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

    async handleRequest(req, res) {
      let result
      for await (const mdlEntry of this.middleware) {
        try {
          result = await mdlEntry.applyHandlers(req, res)
          if (result || res.writableEnded) break
        } catch (error) {
          if (error.message === 'ESMA router') break
          else throw error
        }
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
      if (typeof path !== 'string') throw TypeError(`esma router: 'path' must be a string`)
      const mdEntry = createMiddlewareEntry(path, handlers, { method, router: this, mounting: false, mountpath: path })
      this.middleware.push(mdEntry)
    },

    // setHttpMethodHandler(method) {
    //   this[method] = function(path, ...handlers) {
    //     if (typeof path !== 'string') throw TypeError(`esma router: 'path' must be a string`)
    //     const mdEntry = createMiddlewareEntry(path, handlers, { method, router: this, mounting: false, mountpath: path })
    //     this.middleware.push(mdEntry)
    //   }
    // },

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
  // HTTP_METHODS.forEach(method => r.setHttpMethodHandler(method))

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

    async applyHandlers(req, res) {
      if (method !== '*' && req.method.toLowerCase() !== method) return null
      const match = this.urlPattern.exec({ pathname: req.url })
      // console.debug('--', match, this.urlPattern.pattern.pathname)
      if (!match) return null

      let reqData = { params: {}, query: {} }
      if (match.pathname.groups) reqData.params = {...match.pathname.groups}
      reqData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
      httpPatch.setRequestData(req, reqData)
      // console.debug('-', mdlEntry.path, req.url, req.originalUrl, { reqParams }, mdlEntry.handlers[0].toString().substring(0,40))

      let oldReqUrl = req.url
      let oldBaseUrl = req.baseUrl
      if (mounting) {
        if (this.path !== '/') {
          req.url = req.originalUrl.replace(this.path, '') ?? '/'
          if (!req.url.startsWith('/')) req.url = '/' + req.url
          req.baseUrl = this.path
        }
      }
      let result
      try {
        for await (const handler of this.handlers) {
          if ('type' in handler && handler.type === 'router') {
            result = await handler.handleRequest(req, res)
          }
          if (typeof handler === 'function') {
            if (handler.length === 4) break
            try {
              result = await handler(req, res, next)
            } catch (error) {
              if (error.message.startsWith('ESMA')) {
                const kind = error.message.replace('ESMA ', '')
                if (kind === 'route') break
                if (kind === 'router') throw error
              } else {
                throw error
              }
            }
          }
          if (result || res.writableEnded) break
        }
        req.url = oldReqUrl       // reset
        req.baseUrl = oldBaseUrl  // reset
      } catch (error) {
        if (error.message.startsWith('ESMA')) throw error
        result = { http: { statusCode: 500, body: error.stack || error.message || error, error } }
      }
      return result
    },

  }

  return mdlEntry
}


function next(kind) {
  if (kind instanceof Error) throw kind
  if (kind === undefined) return
  if (['route', 'router'].includes(kind)) {
    throw Error(`ESMA ${kind}`)
  }
}
