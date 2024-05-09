import { URLPattern } from '../deps/urlpattern.js'
import { createNext } from '../patch-request-listener/express-patch.js'
import { HttpError } from '../utils.js'

/**
 * @typedef {{
 *  path: string
 *  method: esma.HttpMethods | '*'
 *  urlPattern: URLPattern
 *  mount: string
 *  handler: function
 * }} HandlerEntry
 */


/** @type {HandlerEntry[]} */
export const handlers = []

/** @type {esma.ErrorHandler[]} */
export const errorHandlers = []


/** @type {(path: string, method: esma.HttpMethods | '*', mount: string, handler: Function) => void} */
export function addHandler(path, method, mount, handler) {
  const pathPattern = path === '/' ? '/*' : path + '{/*}?'
  const urlPattern = new URLPattern({ pathname: pathPattern })

  const handlerEntry = {
    path,
    method,
    urlPattern,
    mount,
    handler,
  }
  handlers.push(handlerEntry)
}


/** @type {(hanlder: esma.ErrorHandler) => void} */
export function addErrorHandler(handler) {
  errorHandlers.push(handler)
}


/** @type {(req: esma.Request, res: esma.Response, ctx: esma.Context) => Promise<esma.HandlerResult>} */
export async function handleRequest(req, res, ctx) {
  let result
  let handled = false
  for await (const handlerEntry of handlers) {
    if (handlerEntry.method !== '*' && handlerEntry.method.toLowerCase() !== req.method?.toLowerCase()) continue
    /** @type {any} */
    const match = handlerEntry.urlPattern.exec({ pathname: req.url })
    if (!match) continue

    handled = true
    let oldReqUrl = req.url
    if (handlerEntry.mount !== '/') {
      req.url = req.url.replace(handlerEntry.mount, '')
      if (req.url === '') req.url = '/'
    }
    const requestData = { params: {}, query: {} }
    if (match.pathname.groups) requestData.params = {...match.pathname.groups}
    requestData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
    Object.assign(req, { params: requestData.params, query: requestData.query })

    ctx.express_action = null
    ctx.express_result = null
    try {
      result = await handlerEntry.handler(req, res, createNext(ctx))
    } catch (error) {
      if (error instanceof HttpError) throw error
      if (error instanceof Error) throw new HttpError(500, error.stack ?? error.message, req, res)
      throw new HttpError(500, String(error), req, res)
    }
    if (ctx.express_action === 'send') result = ctx.express_result
    if (handlerEntry.mount !== '/') req.url = oldReqUrl   // reset req.url

    if (result !== undefined || res.writableEnded) break
  }
  // if at least one handler run but the result is undefined, make it null to mark that the request is handled (avoid 404)
  if (handled && result === undefined) result = null
  return result
}