import { parseRequestBody } from './body-parser.js'

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

export function patchResponse(res, ctx) {
  res.send = body => {
    ctx.express_action = 'send'
    ctx.express_result = body
  }
}


export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
