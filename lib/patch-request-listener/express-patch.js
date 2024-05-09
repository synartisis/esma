import * as http from 'node:http'

/**
 * @typedef {{
 *  url: string
 *  originalUrl: string
 *  baseUrl: string
 *  params: Record<string, string | undefined>
 *  query: Record<string, string | undefined>
 *  body: Record<string, string | any>
 * }} ExpressRequestPatch
 * 
 * @typedef {{
 *  locals: any
 *  send(body: any): void
 *  redirect(loc: string): void
 * }} ExpressResponsePatch
*/


/** @type {(httpRequest: http.IncomingMessage) => http.IncomingMessage & ExpressRequestPatch} */
export function expressPatchRequest(httpRequest) {
  const { url = '' } = httpRequest
  const req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    baseUrl: '',
    params: {},
    query: {},
    body: {},
  })
  return req
}


/** @type {(httpResponse: http.ServerResponse, ctx: esma.Context) => http.ServerResponse & ExpressResponsePatch} */
export function expressPatchResponse(httpResponse, ctx) {
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


///** @type {(ctx: esma.Context) => (kind: Error | undefined | 'route' | 'router') => void} */
/** @type {(ctx: esma.Context) => (kind: Error | undefined) => void} */
export function createNext(ctx) {
  return function next(kind) {
    if (kind instanceof Error) throw kind
    if (kind === undefined) return
    // if (['route', 'router'].includes(kind)) ctx.express_action = kind
  }
}
