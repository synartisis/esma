import { parseRequestBody } from './body-parser.js'


export function patchServer(httpServer, mainRouter) {
  Object.assign(httpServer, mainRouter)
}


export function patchRequest(req) {
  req.originalUrl = req.url
  req.params = {}
  req.query = {}
  req._body = null
  Object.defineProperty(req, 'body', {
    async get() {
      if (!req._body) req._body = await parseRequestBody(req)
      return req._body
    }
  })
}


export function setRequestData(req, { params, query }) {
  req.params = { ...params }
  req.query = { ...query }
}


export function patchResponse(res) {
  res.send = (body) => {
    const err = new Error('ESMA send')
    /** @ts-ignore */
    err.result = body
    throw err
  }
}