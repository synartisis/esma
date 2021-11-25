import { middleware, createMiddlewareEntry } from './middleware.js'

export const router = {}


const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'head', 'options', 'trace', 'patch', 'all']
HTTP_METHODS.forEach(method => addHttpMethod(method))

function addHttpMethod(method) {
  router[method] = function(path, ...handlers) {
    if (typeof path !== 'string') throw TypeError(`esma router: 'path' must be a string`)
    const mdEntry = createMiddlewareEntry(path, handlers, { method, mounting: false })
    middleware.push(mdEntry)
  }
}