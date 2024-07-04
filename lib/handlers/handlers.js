/** @import * as esma from 'esma' */
import { URLPattern } from '../deps/urlpattern.js'
import { HttpError } from '../utils.js'

/**
 * @typedef {{
 *  path: string
 *  method: esma.HttpMethods | '*'
 *  urlPattern: URLPattern
 *  pathPattern: string
 *  mount: string
 *  handler: function
 *  router: RouterObject
 * }} HandlerEntry
 * 
 * @typedef {import('./router.js').RouterObject} RouterObject
 */


/** @type {HandlerEntry[]} */
export const handlers = []

/** @type {esma.ErrorHandler[]} */
export const errorHandlers = []


/** @type {(path: string, method: esma.HttpMethods | '*', mount: string, handler: Function, router: RouterObject) => void} */
export function addHandler(path, method, mount, handler, router) {
  if (method === '*' &&  path !== '/' && path.endsWith('/')) path = path.substring(0, path.length - 1)
  const pathPattern = method === '*'
    ? path === '/' ? '/*' : path + '{/*}?'
    : path
  const urlPattern = new URLPattern({ pathname: pathPattern })

  const handlerEntry = {
    path,
    method,
    urlPattern,
    pathPattern,
    mount,
    handler,
    router,
  }
  handlers.push(handlerEntry)
}


/** @type {(hanlder: esma.ErrorHandler) => void} */
export function addErrorHandler(handler) {
  errorHandlers.push(handler)
}


/** @type {(req: esma.Request, res: esma.Response, ctx: Context) => Promise<esma.HandlerResult>} */
export async function handleRequest(req, res, ctx) {
  let pipedResponse = false
  res.on('pipe', () => { pipedResponse = true })
  let result
  let handled = false
  for await (const handlerEntry of handlers) {
    if (handlerEntry.method !== '*' && handlerEntry.method.toLowerCase() !== req.method?.toLowerCase()) continue
    if (ctx.skippedRouters.includes(handlerEntry.router)) continue
    /** @type {any} */
    const match = handlerEntry.urlPattern.exec({ pathname: req.url })
    if (!match) continue

    if (handlerEntry.method !== '*') handled = true
    let oldReqUrl = req.url
    if (handlerEntry.mount !== '/') {
      req.url = req.url.replace(handlerEntry.mount, '')
      if (req.url === '') req.url = '/'
    }
    const requestData = { params: {}, query: {} }
    if (match.pathname.groups) requestData.params = {...match.pathname.groups}
    requestData.query = Object.fromEntries([...new URL(req.url, 'http://example.com').searchParams])
    Object.assign(req, { params: requestData.params, query: requestData.query })

    try {
      result = await handlerEntry.handler(req, res)
      if (!!result && typeof result === 'object' && '$action' in result) {
        if (result.$action === 'skip-router') {
          ctx.skippedRouters.push(handlerEntry.router)
          result = undefined
        }
      }
    } catch (error) {
      if (error instanceof HttpError) throw error
      if (error instanceof Error) throw new HttpError(500, error.stack ?? error.message, req, res)
      throw new HttpError(500, String(error), req, res)
    }
    if (handlerEntry.mount !== '/') req.url = oldReqUrl   // reset req.url

    if (result !== undefined || res.writableEnded) break
  }
  if (handled) {
    // if at least one handler ran but the result is undefined, make it null to mark that the request is handled (avoid 404)
    if (result === undefined) result = null
    // wait for stream to finish
    if (pipedResponse) await new Promise(resolve => res.on('unpipe', resolve))
  }

  return result
}