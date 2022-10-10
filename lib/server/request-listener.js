import { mainRouter, errorStack } from './router.js'
import { patchRequest, patchResponse } from './express-compat.js'
import { settings } from '../esma-settings.js'
import { getEtag } from './utils.js'
import * as files from './files.js'


/** @type {http.RequestListener} */
export async function requestListener(req, res) {
  const ctx = createEsmaContext()
  if (ctx.settings.env === 'development' && req.url?.startsWith('/esma/')) return esmaRouter(req, res)
  const esmaReq = patchRequest(req, ctx)
  const esmaRes = patchResponse(res, ctx)

  const result = await mainRouter.handleRequest(esmaReq, esmaRes, ctx)
  await finalHandler(esmaReq, esmaRes, ctx, result)
}


/** @type {(req: esma.Request, res: esma.Response, ctx: esma.Context, result: any) => Promise<any>} */
async function finalHandler(req, res, ctx, result) {
  if (res.writableEnded || res.headersSent) return
  if (!result) {
    res.statusCode = 404
    return res.end(`Cannot ${req.method} ${req.originalUrl}`)
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
    if (Object.keys(rest).length > 0) {
      return sendJson(res, rest, ctx)
    } else {
      return res.end()
    }
  }
  return sendResponse(res, String(result), {
    contentType: 'text/plain',
    eTagType: ctx.settings.etag
  })
}


/** @type {(res: esma.Response, result: any, options: any) => void} */
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


/** @type {(res: esma.Response, obj: any, ctx: esma.Context) => void} */
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


/** @type {(req: esma.Request, res: esma.Response, error: Error) => Promise<any>} */
async function applyErrorHandlers(req, res, error) {
  let errorResult
  for await (const errorHandler of errorStack) {
    errorResult = await errorHandler(error, req, res)
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


/** @type {http.RequestListener} */
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
