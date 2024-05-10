import * as esma from 'esma'
import * as http from 'node:http'
import { attachSession } from '../middleware/session.js'

/**
 * @typedef {import('./express-patch.js').ExpressRequestPatch} ExpressRequestPatch
 * @typedef {import('./express-patch.js').ExpressResponsePatch} ExpressResponsePatch
 */



/** @type {(reqExpress: http.IncomingMessage & ExpressRequestPatch, httpResponse: http.ServerResponse) => esma.Request} */
export function esmaPatchRequest(reqExpress, httpResponse) {
  const reqEsma = Object.assign(reqExpress, {
    view: {},
    bag: {},
    session: attachSession(reqExpress, httpResponse),
  })
  return reqEsma
}


/** @type {(resExpress: http.ServerResponse & ExpressResponsePatch, esmaReq: esma.Request, ctx: Context) => esma.Response} */
export function esmaPatchResponse(resExpress, esmaReq, ctx) {
  const resEsma = Object.assign(resExpress, {
    view: esmaReq.view,
    bag: esmaReq.bag,
  })
  return resEsma
}