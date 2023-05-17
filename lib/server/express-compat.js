import * as http from 'node:http'
import { parseRequestBody } from './body-parser.js'

/** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma/private').Context} Context */


/** @type {(httpRequest: http.IncomingMessage, res: Response, ctx: Context) => Promise<Request>} */
export async function patchRequest(httpRequest, res, ctx) {
  const { url = '', method = '' } = httpRequest
  const req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    baseUrl: '',
    params: {},
    query: {},
    body: {},
    session: undefined
  })
  if (['POST', 'PUT', 'PATCH'].includes(method)) req.body = await parseRequestBody(req, res, ctx)
  return req
}


/** @type {(httpResponse: http.ServerResponse, ctx: Context) => Response} */
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


/** @type {(ctx: Context) => (kind: any) => any} */
export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
