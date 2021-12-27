import { parseRequestBody } from './body-parser.js'


/** @type {(req: esma.Request, ctx: esma.Context) => void} */
export function patchRequest(req, ctx) {
  req.originalUrl = req.url
  req.params = {}
  req.query = {}
  req._body = null
  Object.defineProperty(req, 'body', {
    async get() {
      if (!req._body) req._body = await parseRequestBody(req, ctx)
      return req._body
    }
  })
}


/** @type {(res: esma.Response, ctx: esma.Context) => void} */
export function patchResponse(res, ctx) {
  res.locals = {}
  res.send = body => {
    ctx.express_action = 'send'
    ctx.express_result = body
  }
  res.redirect = loc => {
    res.writeHead(302, {
      'Location': loc
    }).end()
  }
}


/** @type {(ctx: esma.Context) => (kind: any) => any} */
export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
