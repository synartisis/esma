import { parseRequestBody } from './body-parser.js'


/** @type {(httpRequest: http.IncomingMessage, ctx: esma.Context) => esma.Request} */
export function patchRequest(httpRequest, ctx) {
  const url = httpRequest.url ?? ''
  const req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    baseUrl: '',
    params: {},
    query: {},
    _body: null,
    get body() {
      return new Promise((resolve, reject) => {
        if (req._body) return resolve(req._body)
        if (!req._body) {
          parseRequestBody(req, ctx)
          .then(value => {
            req._body = value
            resolve(value)
          })
          .catch(reject)
        }
      })
    },
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
