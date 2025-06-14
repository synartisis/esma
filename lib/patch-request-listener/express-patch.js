/** @import * as http from 'node:http' */

/**
 * @typedef {{
 *  url: string
 *  originalUrl: string
 *  params: Record<string, string | undefined>
 *  query: Record<string, string | undefined>
 *  body: any
 * }} ExpressRequestPatch
 * 
 * @typedef {{
 *  locals: Record<string, unknown>
 *  redirect(loc: string): void
 * }} ExpressResponsePatch
*/


/** @type {(httpRequest: http.IncomingMessage) => http.IncomingMessage & ExpressRequestPatch} */
export function expressPatchRequest(httpRequest) {
  const { url = '' } = httpRequest
  const req = Object.assign(httpRequest, {
    url,
    originalUrl: url,
    params: {},
    query: {},
    body: {},
  })
  return req
}


/** @type {(httpResponse: http.ServerResponse, ctx: types.Context) => http.ServerResponse & ExpressResponsePatch} */
export function expressPatchResponse(httpResponse, ctx) {
  const res = Object.assign(httpResponse, {
    locals: {},
    redirect: (/** @type {string} */loc) => {
      res.writeHead(302, {
        'Location': loc
      }).end()
    }
  })
  return res
}
