import * as http from 'node:http'
import { mainRouter, errorStack } from './router.js'
import { patchRequest, patchResponse } from './express-compat.js'
import { settings } from '../esma-settings.js'
import { HttpError, getEtag } from './utils.js'
import * as files from './files.js'

/** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma/private').Context} Context */


/** @type {http.RequestListener} */
export async function requestListener(req, res) {
  const ctx = createEsmaContext()
  if (ctx.settings.env === 'development' && req.url?.startsWith('/esma/')) { esmaViewer(req, res); return }
  /** @type {Request?} */
  let esmaReq = null
  /** @type {Response?} */
  let esmaRes = null
  try {
    esmaReq = await patchRequest(req, ctx)
    esmaRes = patchResponse(res, ctx)
    const result = await mainRouter.handleRequest(esmaReq, esmaRes, ctx)
    await finalHandler(esmaReq, esmaRes, ctx, result)
  } catch (error) {
    if (error instanceof HttpError && esmaReq && esmaRes) {
      await handleError(esmaReq, esmaRes, error, ctx)
    } else {
      throw error
    }
  }
}


/** @type {(req: Request, res: Response, ctx: Context, result: any) => Promise<Response | undefined>} */
async function finalHandler(req, res, ctx, result) {
  if (res.writableEnded || res.headersSent) return
  if (result === undefined) {
    throw new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`)
  }
  if (result === null) {
    return sendResponse(res, null, {})
  }
  if (result instanceof Buffer) {
    return sendResponse(res, result, { 
      contentType: 'application/octet-stream',
      contentLength: result.byteLength,
      eTagType: ctx.settings.etag
    })
  }
  if (typeof result === 'string') {
    return sendResponse(res, result, {
      contentType: String(res.getHeader('Content-Type') || 'text/html'),
      contentLength: Buffer.from(result).byteLength,
      eTagType: ctx.settings.etag
    })
  }
  if (['array', 'date'].includes(getType(result))) {
    return sendJson(res, result, ctx)
  }
  if (getType(result) === 'object') {
    const { $statusCode, $headers, $body, ...rest } = result
    if ($statusCode) res.statusCode = $statusCode
    if ($headers) Object.entries($headers).forEach(([k, v]) => res.setHeader(k, v))
    if ($body) return finalHandler(req, res, ctx, $body)
    return sendJson(res, rest, ctx)
  }
  return sendResponse(res, String(result), {
    contentType: 'text/plain',
    eTagType: ctx.settings.etag
  })
}


/** @type {(res: Response, result: any, options: { contentType?: string, contentLength?: number, eTagType?: 'weak' | 'strong' }) => Response} */
function sendResponse(res, result, { contentType = undefined, contentLength = undefined, eTagType = undefined } = {}) {
  if (contentType !== undefined && !res.hasHeader('Content-Type')) {
    if (!contentType.includes('charset') && (
        contentType.split('/')[0].trim().toLowerCase() === 'text' || contentType.trim().toLowerCase() === 'application/json')
      ) {
        contentType += '; charset=utf-8'
    }
    res.setHeader('Content-Type', contentType)
  }
  if (contentLength !== undefined && !res.hasHeader('Content-Length')) res.setHeader('Content-Length', contentLength)
  if (eTagType !== undefined && !res.hasHeader('ETag')) {
    const eTag = getEtag(result, eTagType)
    if (eTag) res.setHeader('ETag', eTag)
  }
  return res.end(result)
}


/** @type {(res: Response, obj: any, ctx: Context) => Response} */
function sendJson(res, obj, ctx) {
  const json = JSON.stringify(obj)
  return sendResponse(res, json, {
    contentType: 'application/json',
    contentLength: Buffer.from(json).byteLength,
    eTagType: ctx.settings.etag
  })
}


/** @type {(obj: any) => string} */
function getType(obj) {
  if (Array.isArray(obj)) return 'array'
  if (obj != null && obj.constructor === Date) return 'date'
  if (obj != null && obj.constructor === Object) return 'object'
  return ''
}


/** @type {(req: Request, res: Response, error: HttpError, ctx: Context) => Promise<void>} */
async function handleError(req, res, error, ctx) {
  res.statusCode = error.statusCode
  if (errorStack.length) {
    const errorResult = await applyErrorHandlers(req, res, error)
    if (res.writableEnded) return
    if (errorResult !== undefined) { sendResponse(res, errorResult, { contentType: 'text/plain' }); return }
  }
  if (ctx.settings.env === 'development') {
    sendResponse(res, error.message, { contentType: 'text/plain' })
  } else {
    sendResponse(res, 'Server Error', { contentType: 'text/plain' })
  }
}


/** @type {(req: Request, res: Response, error: Error) => Promise<any>} */
async function applyErrorHandlers(req, res, error) {
  let errorResult
  for await (const errorHandler of errorStack) {
    errorResult = await errorHandler(error, req, res)
    if (errorResult || res.writableEnded) break
  }
  return errorResult
}


/** @type {() => Context} */
function createEsmaContext() {
  return {
    settings,
    express_action: null,
    express_result: null,
  }
}


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function esmaViewer(req, res) {
  if (req.url === '/esma/') return res.end(`<a href="ls">ls</a><br><a href="routes">routes</a><br><a href="files">files</a>`)
  if (req.url === '/esma/ls') return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, urlPattern: null})), null, 2))
  if (req.url === '/esma/routes') {
    const result = '<!doctype html><table><tr><td>' + walkRoutes(mainRouter).map(o => [o.method, o.path, o.content].join('</td><td>')).join('</td></tr><tr><td>') + '</td></tr></table>'
    return res.end(result)
  }
  if (req.url === '/esma/files') {
    return res.end(files.fileIndex.map(o => o.fname).join('\n') + '\n')
  }
  return res.end('esma: not found')
}

/** @type {(parrent: import('esma/private').RouterObject, routes?: any[]) => any[]} */
function walkRoutes(parrent, routes=[]) {
  if (Array.isArray(parrent.middleware)) {
    for (const middleware of parrent.middleware) {
      const entry = { path: (middleware.router.mountpath + middleware.path).replace('//', '/'), method: middleware.method, content: '' }
      routes.push(entry)
      for (const handler of middleware.handlers) {
        if ('type' in handler && handler.type === 'router') {
          entry.content += 'ROUTER'
          walkRoutes(handler, routes)
        } else {
          entry.content += handler.toString().substring(0, 100) + '<br>'
        }
      }
    }
  }
  return routes
}