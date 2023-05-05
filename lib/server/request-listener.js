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
  if (ctx.settings.env === 'development' && req.url?.startsWith('/esma/')) { esmaRouter(req, res); return }
  try {
    const esmaReq = await patchRequest(req, ctx)
    const esmaRes = patchResponse(res, ctx)
    const result = await mainRouter.handleRequest(esmaReq, esmaRes, ctx)
    await finalHandler(esmaReq, esmaRes, ctx, result)
  } catch (error) {
    if (error instanceof HttpError) {
      res.writeHead(error.statusCode, error.message).end()
    } else {
      throw error
    }
  }
}


/** @type {(req: Request, res: Response, ctx: Context, result: any) => Promise<Response | undefined>} */
async function finalHandler(req, res, ctx, result) {
  if (res.writableEnded || res.headersSent) return
  if (result === undefined) {
    res.statusCode = 404
    return sendResponse(res, `Cannot ${req.method} ${req.originalUrl}`, { 
      contentType: 'text/plain',
    })
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
      contentType: res.getHeader('Content-Type') || 'text/html',
      contentLength: res.getHeader('Content-Length') || Buffer.from(result).byteLength,
      eTagType: ctx.settings.etag
    })
  }
  if (['array', 'date'].includes(getType(result))) {
    return sendJson(res, result, ctx)
  }
  if (getType(result) === 'object') {
    const { $statusCode, $headers, $body, $error, ...rest } = result
    if ($error) {
      res.setHeader('Content-Type', 'text/plain')
      res.statusCode = 500
      if (errorStack.length) {
        const errorResult = await applyErrorHandlers(req, res, $error)
        if (res.writableEnded) return
        if (errorResult) return sendJson(res, errorResult, ctx)
      }
    }
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


/** @type {(res: Response, result: any, options: any) => Response} */
function sendResponse(res, result, { contentType = null, contentLength = null, eTagType = null } = {}) {
  if (contentType !== null && !res.hasHeader('Content-Type')) {
    if (!contentType.includes('charset') && (
        contentType.split('/')[0].trim().toLowerCase() === 'text' || contentType.trim().toLowerCase() === 'application/json')
      ) {
        contentType += '; charset=utf-8'
    }
    res.setHeader('Content-Type', contentType)
  }
  if (contentLength !== null && !res.hasHeader('Content-Length')) res.setHeader('Content-Length', contentLength)
  if (eTagType && !res.hasHeader('ETag')) {
    const eTag = getEtag(result, eTagType)
    if (eTag) res.setHeader('ETag', eTag)
  }
  return res.end(result)
}


/** @type {(res: Response, obj: any, ctx: Context) => Response} */
function sendJson(res, obj, ctx) {
  return sendResponse(res, JSON.stringify(obj), {
    contentType: 'application/json',
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
function esmaRouter(req, res) {
  if (req.url === '/esma/ls') return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, urlPattern: null})), null, 2))
  if (req.url === '/esma/routes') {
    const result = mainRouter
    return res.end(JSON.stringify(result, null, 2) + '\n')
  }
  if (req.url === '/esma/files') {
    return res.end(files.fileIndex.map(o => o.fname).join('\n') + '\n')
  }
  return res.end('esma: not found')
}
