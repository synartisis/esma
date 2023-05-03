import * as http from 'node:http'
import { parseRequestBody } from './body-parser.js'

/** @typedef {import('../types.js').esma.Request} esma.Request */
/** @typedef {import('../types.js').esma.Response} esma.Response */
/** @typedef {import('../types.js').esma.Context} esma.Context */


/** @type {(httpRequest: http.IncomingMessage, ctx: esma.Context) => esma.Request} */
export function patchRequest(httpRequest, ctx) {
  const url = httpRequest.url ?? ''
  let req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    baseUrl: '',
    params: {},
    query: {},
    _body: undefined,
    body: Promise.resolve({}),
  })
  Object.defineProperty(req, 'body', {
    async get() {
      if (!req._body) {
        req._body = await parseRequestBody(req, ctx)
      }
      return req._body
    }
  })
  return req
}


/** @type {(httpResponse: http.ServerResponse, ctx: esma.Context) => esma.Response} */
export function patchResponse(httpResponse, ctx) {
  const res = Object.assign(httpResponse, {
    locals: {},
    send: (/** @type {any} */body) => {
      ctx.express_action = 'send'
      ctx.express_result = body
    },
    redirect: (/** @type {string} */loc) => {
      res.writeHead(302, {
        'Location': loc
      }).end()
    }
  })
  return res
}


/** @type {(ctx: esma.Context) => (kind: any) => any} */
export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
