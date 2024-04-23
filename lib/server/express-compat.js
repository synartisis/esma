import * as http from 'node:http'
import { parseRequestBody } from './body-parser.js'
import { attachSession } from './session.js'



/** @type {(httpRequest: http.IncomingMessage, res: esma.Response, ctx: esma.Context) => Promise<esma.Request<unknown>>} */
export async function patchRequest(httpRequest, res, ctx) {
  const { url = '', method = '' } = httpRequest
  const req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    baseUrl: '',
    params: {},
    query: {},
    body: {},
    session: attachSession(httpRequest, res),
  })
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) req.body = await parseRequestBody(req, res, ctx)
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


/** @type {(ctx: esma.Context) => (kind: Error | undefined | 'route' | 'router') => void} */
export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
