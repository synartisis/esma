import { middleware, createMiddlewareEntry } from './middleware.js'

export const router = {

  // get(path, ...handlers) {
  //   if (typeof path !== 'string') throw TypeError(`get: 'path' must be a string`)
  //   const mdEntry = createMiddlewareEntry(path, handlers, { method: 'get', mounting: false })
  //   middleware.push(mdEntry)
  // },

  // post(path, ...handlers) {
  //   if (typeof path !== 'string') throw TypeError(`post: 'path' must be a string`)
  //   const mdEntry = createMiddlewareEntry(path, handlers, { method: 'post', mounting: false })
  //   middleware.push(mdEntry)
  // }

}


const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'head', 'options', 'trace', 'patch', 'all']
HTTP_METHODS.forEach(method => addHttpMethod(method))

function addHttpMethod(method) {
  router[method] = function(path, ...handlers) {
    if (typeof path !== 'string') throw TypeError(`${method}: 'path' must be a string`)
    const mdEntry = createMiddlewareEntry(path, handlers, { method, mounting: false })
    middleware.push(mdEntry)
  }
}