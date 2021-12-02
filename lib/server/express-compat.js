import { parseRequestBody } from './body-parser.js'

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

export function patchResponse(res, ctx) {
  res.send = body => {
    ctx.express_action = 'send'
    ctx.express_result = body
  }
}