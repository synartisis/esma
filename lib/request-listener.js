import * as httpPatch from './http-patch.js'
import { mainRouter } from './router.js'


export async function requestListener(req, res) {
  if (req.url.startsWith('/esma/')) return esmaRouter(req, res)
  httpPatch.patchRequest(req)
  // console.debug(await req.body)

  const result = await mainRouter.handleRequest(req, res)
  finalHandler(req, res, result)
}




function finalHandler(req, res, result) {
  if (res.writableEnded) return
  if (!result) return res.writeHead(404).end()
  if (result instanceof Object) {
    const { http, ...rest } = result
    if (http) {
      const { statusCode, headers, body } = http
      if (statusCode) res.statusCode = statusCode
      if (headers) {
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
      }
      if (body) {
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


function esmaRouter(req, res) {
  if (req.url === '/esma/ls') return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, rePattern: null})), null, 2))
  if (req.url === '/esma/routes') {
    const result = mainRouter

    return res.end(JSON.stringify(result, null, 2) + '\n')
  }
  return res.end('esma: not found')
}
