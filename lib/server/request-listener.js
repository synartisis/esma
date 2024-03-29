import * as http from 'node:http'
import { mainRouter, errorStack } from './router.js'
import { patchRequest, patchResponse } from './express-compat.js'
import { settings } from '../esma-settings.js'
import { HttpError, getEtag } from './utils.js'
import { esmaViewer } from './esma-viewer.js'
import { attachSession } from './session.js'


/** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma').MiddlewareResult} MiddlewareResult */
/** @typedef {import('esma/private').Context} Context */


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<MiddlewareResult>} */
export async function requestListener(req, res) {
  const ctx = createEsmaContext()
  if (ctx.settings.env === 'development' && (req.url === '/esma' || req.url?.startsWith('/esma/'))) return esmaViewer(req, res)
  try {
    const esmaRes = patchResponse(res, ctx)
    const esmaReq = await patchRequest(req, esmaRes, ctx)
    attachSession(esmaReq)
    const result = await mainRouter.handleRequest(esmaReq, esmaRes, ctx)
    if (!res.writableEnded) finalHandler(esmaReq, esmaRes, ctx, result)
  } catch (error) {
    if (error instanceof HttpError) {
      await handleError(error, ctx)
    } else {
      throw error
    }
  }
}


/** @type {(req: Request, res: Response, ctx: Context, result: any) => void} */
function finalHandler(req, res, ctx, result) {
  if (result === undefined) {
    throw new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`, req, res)
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
    const contentType = String(res.getHeader('Content-Type') || 'text/html')
    return sendResponse(res, result, {
      contentType,
      contentLength: Buffer.from(result).byteLength,
      eTagType: contentType.includes('text/html') ? undefined : ctx.settings.etag
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


/** @type {(res: Response, result: any, options: { contentType?: string, contentLength?: number, eTagType?: 'weak' | 'strong' }) => void} */
function sendResponse(res, result, { contentType = undefined, contentLength = undefined, eTagType = undefined } = {}) {
  if (res.writableEnded) return
  if (res.headersSent) { res.end('Server Error: Headers sent'); return }
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
  res.end(result)
}


/** @type {(res: Response, obj: unknown, ctx: Context) => void} */
function sendJson(res, obj, ctx) {
  const json = JSON.stringify(obj)
  return sendResponse(res, json, {
    contentType: 'application/json',
    contentLength: Buffer.from(json).byteLength,
    eTagType: ctx.settings.etag
  })
}


/** @type {(obj: unknown) => string} */
function getType(obj) {
  if (Array.isArray(obj)) return 'array'
  if (obj != null && obj instanceof Date) return 'date'
  if (obj != null && obj instanceof Object) return 'object'
  return ''
}


/** @type {(error: HttpError, ctx: Context) => Promise<void>} */
async function handleError(error, ctx) {
  error.res.statusCode = error.statusCode
  if (errorStack.length) {
    const errorResult = await applyErrorHandlers(error.req, error.res, error)
    if (error.res.writableEnded) return
    if (errorResult !== undefined) { sendResponse(error.res, errorResult, { contentType: 'text/plain' }); return }
  }
  if (ctx.settings.env === 'development') {
    sendResponse(error.res, error.message, { contentType: 'text/plain' })
  } else {
    if (error.res.statusCode >= 500) {
      console.error(error.req.method, error.req.url, error.message)
      sendResponse(error.res, 'Server Error', { contentType: 'text/plain' })
    } else {
      sendResponse(error.res, `${error.message}`, { contentType: 'text/plain' })
    }
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
