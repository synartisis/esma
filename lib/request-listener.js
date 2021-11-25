import * as httpPatch from './http-patch.js'
import { middleware } from './middleware.js'


export async function requestListener(req, res) {
  httpPatch.patchRequest(req)
  // console.debug(await req.body)

  let result
  for await (const mdlEntry of middleware) {
    const match = mdlEntry.match(req)
    // console.debug(mdEntry.path, req.url, {match})
    if (match) {
      httpPatch.setMiddlewareParams(req, match)
      try {
        result = await mdlEntry.run(req, res, next.bind(req))
      } catch (error) {
        result = { http: { statusCode: 500, body: error.stack || error.message || error } }
      }
    }
    if (result || res.writableEnded) break
  }
  finalHandler(req, res, result)
}


function next(err) {
  if (err instanceof Error) {
    throw err
  } else {
    console.warn(`[esma] next() is not supported. Called at url: ${this.url}`)
  }
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