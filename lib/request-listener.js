import * as httpPatch from './http-patch.js'
import { mainRouter, errorStack } from './router.js'


export async function requestListener(req, res) {
  if (req.url.startsWith('/esma/')) return esmaRouter(req, res)
  httpPatch.patchRequest(req)
  // console.debug(await req.body)

  const result = await mainRouter.handleRequest(req, res)
  await finalHandler(req, res, result)
}




async function finalHandler(req, res, result) {
  if (res.writableEnded) return
  if (!result) return res.writeHead(404).end()
  if (result instanceof Object) {
    const { http, ...rest } = result
    if (http) {
      const { statusCode, headers, body, error } = http
      if (error && errorStack.length) {
        const errorResult = await applyErrorHandlers(req, res, error)
        if (res.writableEnded) return
        if (errorResult) {
          return sendJson(res, errorResult)
        }
      }
      if (statusCode) res.statusCode = statusCode
      if (headers) {
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
      }
      if (body || Object.keys(rest).length === 0) {
        return res.end(body)
      } else {
        return sendJson(res, rest)
      }
    } else {
      return sendJson(res, result)
    }
  }
  return res.end(String(result))
}


function sendJson(res, obj) {
  const json = JSON.stringify(obj)
  res.setHeader('Content-Type', 'application/json')
  return res.end(json)
}


async function applyErrorHandlers(req, res, error) {
  let errorResult
  for await (const errorHandler of errorStack) {
    errorResult = await errorHandler(error, res, res, () => {})
    if (errorResult || res.writableEnded) break
  }
  return errorResult
}


function esmaRouter(req, res) {
  if (req.url === '/esma/ls') return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, urlPattern: null})), null, 2))
  if (req.url === '/esma/routes') {
    const result = mainRouter

    return res.end(JSON.stringify(result, null, 2) + '\n')
  }
  return res.end('esma: not found')
}
