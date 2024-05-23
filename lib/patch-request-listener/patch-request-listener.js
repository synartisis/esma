import * as http from 'node:http'
import * as esma from 'esma'
import { expressPatchRequest, expressPatchResponse } from './express-patch.js'
import { esmaPatchRequest, esmaPatchResponse } from './esma-patch.js'


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, ctx: Context) => { reqEsma: esma.Request, resEsma: esma.Response }} */
export function patchRequestListener(httpRequest, httpResponse, ctx) {
  const reqEsma = patchRequest(httpRequest, httpResponse)
  const resEsma = patchResponse(httpResponse, reqEsma, ctx)
  return { reqEsma, resEsma }
}


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.Request} */
function patchRequest(httpRequest, httpResponse) {
  const reqExpress = expressPatchRequest(httpRequest)
  const reqEsma = esmaPatchRequest(reqExpress, httpResponse)
  return reqEsma
}


/** @type {(httpResponse: http.ServerResponse, reqEsma: esma.Request, ctx: Context) => esma.Response} */
function patchResponse(httpResponse, reqEsma, ctx) {
  const resExpress = expressPatchResponse(httpResponse, ctx)
  const resEsma = esmaPatchResponse(resExpress, reqEsma)
  return resEsma
}