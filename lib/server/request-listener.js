import { mainRouter, errorStack } from './router.js'
import { patchRequest, patchResponse } from './express-compat.js'
import { settings } from '../esma-settings.js'
import { getEtag } from './utils.js'


export async function requestListener(req, res) {
  const ctx = createEsmaContext()
  if (ctx.settings.env === 'development' && req.url.startsWith('/esma/')) return esmaRouter(req, res)
  patchRequest(req, ctx)
  patchResponse(res, ctx)

  const result = await mainRouter.handleRequest(req, res, ctx)
  await finalHandler(req, res, ctx, result)
}


/** @type {(req: esma.Request, res: esma.Response, ctx: object, result: any) => Promise<void>} */
async function finalHandler(req, res, ctx, result) {
  if (res.writableEnded) return
  if (!result) {
    res.statusCode = 404
    return res.end()
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
      contentType: 'text/html',
      contentLength: (new TextEncoder().encode(result)).length,
      eTagType: ctx.settings.etag
    })
  }
  if (['array', 'date'].includes(getType(result))) {
    return sendJson(res, result, ctx)
  }
  if (getType(result) === 'object') {
    const { $statusCode, $headers, $body, $error, ...rest } = result
    if ($error && errorStack.length) {
      const errorResult = await applyErrorHandlers(req, res, $error)
      if (res.writableEnded) return
      if (errorResult) return sendJson(res, errorResult, ctx)
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


function sendResponse(res, result,{ contentType = null, contentLength = null, eTagType = null }) {
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


function sendJson(res, obj, ctx) {
  return sendResponse(res, JSON.stringify(obj), {
    contentType: 'application/json',
    eTagType: ctx.settings.etag
  })
}


function getType(obj) {
  if (Array.isArray(obj)) return 'array'
  if (obj != null && obj.constructor === Date) return 'date'
  if (obj != null && obj.constructor === Object) return 'object'
}


async function applyErrorHandlers(req, res, error) {
  let errorResult
  for await (const errorHandler of errorStack) {
    errorResult = await errorHandler(error, res, res, () => {})
    if (errorResult || res.writableEnded) break
  }
  return errorResult
}


function createEsmaContext() {
  return {
    settings,
    express_action: null,
    express_result: null,
  }
}


function esmaRouter(req, res) {
  if (req.url === '/esma/ls') return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, urlPattern: null})), null, 2))
  if (req.url === '/esma/routes') {
    const result = mainRouter

    return res.end(JSON.stringify(result, null, 2) + '\n')
  }
  return res.end('esma: not found')
}
