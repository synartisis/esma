export const middleware = []


export function use(path, ...handlers) {
  const mdEntry = createMiddlewareEntry(path, handlers)
  // console.log({mdEntry})
  middleware.push(mdEntry)
}


function createMiddlewareEntry(path, handlers) {
  if (typeof path === 'function') {
    handlers = [ path, ...handlers ]
    path = null
  }
  const mdEntry = {
    path,
    handlers,

    test(url) {
      if (!this.path) return true
      return url.startsWith(this.path)
    },

    async run(req, res, next) {
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
