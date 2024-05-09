import * as http from 'node:http'
import { settings } from './esma-settings.js'
import { HttpError, getEtag } from './utils.js'
import { esmaViewer } from './esma-viewer/esma-viewer.js'
import { parseRequestBody } from './middleware/body-parser.js'
import { patchRequestListener } from './patch-request-listener/patch-request-listener.js'
import { errorHandlers, handleRequest } from './handlers/handlers.js'


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>} */
export async function requestListener(req, res) {
  const ctx = createEsmaContext()
  if (ctx.settings.env === 'development' && (req.url === '/esma' || req.url?.startsWith('/esma/'))) return esmaViewer(req, res)

  const { reqEsma, resEsma } = patchRequestListener(req, res, ctx)
  try {
    if (['POST', 'PUT', 'PATCH'].includes(reqEsma.method ?? '')) reqEsma.body = await parseRequestBody(reqEsma, resEsma, ctx)
    const result = await handleRequest(reqEsma, resEsma, ctx)
    // const result = await mainRouter.handleRequest(reqEsma, resEsma, ctx)
    if (!res.writableEnded) finalHandler(reqEsma, resEsma, ctx, result)
  } catch (error) {
    if (error instanceof HttpError) {
      await handleError(error, ctx)
    } else {
      throw error
    }
  }
}


/** @type {(req: esma.Request<unknown>, res: esma.Response, ctx: esma.Context, result: esma.HandlerResult) => void} */
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
    const contentType = String(res.getHeader('Content-Type') ?? 'text/html')
    return sendResponse(res, result, {
      contentType,
      contentLength: Buffer.from(result).byteLength,
      eTagType: contentType.includes('text/html') ? undefined : ctx.settings.etag
    })
  }
  if (typeof result === 'object') {
    if (['array', 'date'].includes(getObjectType(result))) {
      return sendJson(res, result, ctx)
    }
    if (getObjectType(result) === 'object') {
      // const { $statusCode, $headers, $body, ...rest } = result
      if ('$statusCode' in result && typeof result.$statusCode === 'number') { res.statusCode = result.$statusCode; delete result.$statusCode }
      if ('$headers' in result && typeof result.$headers === 'object' && !!result.$headers) {
        Object.entries(result.$headers).forEach(([k, v]) => res.setHeader(k, v))
        delete result.$headers
      }
      if ('$body' in result && result.$body) return finalHandler(req, res, ctx, result.$body)
      return sendJson(res, result, ctx)
    }
  }
  return sendResponse(res, String(result), {
    contentType: 'text/plain',
    eTagType: ctx.settings.etag
  })
}


/** @type {(res: esma.Response, result: unknown, options: { contentType?: string, contentLength?: number, eTagType?: 'weak' | 'strong' }) => void} */
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


/** @type {(res: esma.Response, obj: unknown, ctx: esma.Context) => void} */
function sendJson(res, obj, ctx) {
  const json = JSON.stringify(obj)
  return sendResponse(res, json, {
    contentType: 'application/json',
    contentLength: Buffer.from(json).byteLength,
    eTagType: ctx.settings.etag
  })
}


/** @type {(obj: object) => 'array' | 'date' | 'object' | 'unknown'} */
function getObjectType(obj) {
  if (Array.isArray(obj)) return 'array'
  if (obj != null && obj instanceof Date) return 'date'
  if (obj != null && obj instanceof Object) return 'object'
  return 'unknown'
}


/** @type {(error: HttpError, ctx: esma.Context) => Promise<void>} */
async function handleError(error, ctx) {
  error.res.statusCode = error.statusCode
  if (errorHandlers.length) {
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


/** @type {(req: esma.Request<unknown>, res: esma.Response, error: Error) => Promise<any>} */
async function applyErrorHandlers(req, res, error) {
  let errorResult
  for await (const errorHandler of errorHandlers) {
    errorResult = await errorHandler(req, res, error)
    if (errorResult || res.writableEnded) break
  }
  return errorResult
}


/** @type {() => esma.Context} */
function createEsmaContext() {
  return {
    settings,
    express_action: null,
    express_result: null,
  }
}
