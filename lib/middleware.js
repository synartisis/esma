export const middleware = []


export function use(path, ...handlers) {
  if (typeof path === 'function') {
    handlers = [ path, ...handlers ]
    path = '/'
  }
  const mdEntry = createMiddlewareEntry(path, handlers, { mounting: true })
  // console.log({mdEntry})
  middleware.push(mdEntry)
}


export function createMiddlewareEntry(path, handlers, { method = '*', mounting = false }) {
  if (method === 'all') method = '*'
  const mdEntry = {
    path,
    method,
    handlers,

    test(req) {
      if (method !== '*' && req.method.toLowerCase() !== method) return false
      if (!this.path) return true
      if (mounting) {
        return req.url === this.path || req.url.startsWith(endWithSlash(this.path))
      } else {
        return req.url === this.path
      }
    },

    async run(req, res, next) {
      if (mounting) {
        if (this.path !== '/') {
          req.url = req.originalUrl.replace(this.path, '') ?? '/'
          if (!req.url.startsWith('/')) req.url = '/' + req.url
          req.baseUrl = this.path
        }
        // console.log('**', req.originalUrl, req.url, this.path, req.baseUrl)
      }

      let result
      for await (const handler of this.handlers) {
        result = await handler(req, res, next)
        if (result?.http) {
          const { statusCode, headers } = result.http
          if (statusCode) res.statusCode = statusCode
          if (headers) {
            Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
          }
          delete result.http
        }
        if (result || res.writableEnded) break
      }
      return result
    },

  }
  return mdEntry
}

function endWithSlash(str) {
  if (str[str.length - 1] === '/') return str
  return str + '/'
}
