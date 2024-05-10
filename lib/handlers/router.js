import * as esma from 'esma'
import { addHandler, errorHandlers } from "./handlers.js"

/**
 * @typedef {{
 *  mountpath: string | null
 *  use: (pathOrHandler: string | esma.Handler | RouterObject, ...handlers: Array<esma.Handler | RouterObject>) => void
 *  _method(method: esma.HttpMethods, path: string, handlers: esma.Handler[]): void
 *  onerror(handler: esma.ErrorHandler): void
 *  handlers: { method: esma.HttpMethods | '*', path: string, handler: esma.Handler }[]
 * } & {
 *  [method in esma.HttpMethods]: (path: string, ...handlers: esma.Handler[]) => void
 * }} RouterObject
*/


export function router() {
  /** @type {RouterObject} */
  const r = {

    mountpath: null,
    handlers: [],

    use(path, ...handlers) {
      if (typeof path !== 'string') {
        handlers = [ path, ...handlers ]
        path = '/'
      }
      for (const handler of handlers) {
        if (typeof handler === 'function') {
          // function handler
          this.handlers.push({ method: '*', path, handler })
          if (this.mountpath !== null) {
            const handlerPath = joinpaths(this.mountpath, path)
            addHandler(handlerPath, '*', handlerPath, handler)
          }
        } else {
          // router object
          const childRouter = handler
          childRouter.mountpath = joinpaths(this.mountpath ?? '/', path)
          for (const childHandler of childRouter.handlers) {
            const childHandlerMount = childHandler.method !== '*' ? childRouter.mountpath : joinpaths(childRouter.mountpath, childHandler.path)
            addHandler(joinpaths(childRouter.mountpath, childHandler.path), childHandler.method, childHandlerMount, childHandler.handler)
          }
        }
      }
    },

    ['get'](path, ...handlers) { this._method('get', path, handlers) },
    ['post'](path, ...handlers) { this._method('post', path, handlers) },
    ['put'](path, ...handlers) { this._method('put', path, handlers) },
    ['delete'](path, ...handlers) { this._method('delete', path, handlers) },
    ['head'](path, ...handlers) { this._method('head', path, handlers) },
    ['options'](path, ...handlers) { this._method('options', path, handlers) },
    ['trace'](path, ...handlers) { this._method('trace', path, handlers) },
    ['patch'](path, ...handlers) { this._method('patch', path, handlers) },

    _method(method, path, handlers) {
      if (typeof path !== 'string') return // do not add handler if path is missing
      for (const handler of handlers) {
        if (typeof handler !== 'function') continue
        this.handlers.push({ method, path, handler })
        if (this.mountpath !== null) {
          addHandler(joinpaths(this.mountpath, path), method, this.mountpath, handler)
        }
      }
    },

    onerror(errorHandler) {
      errorHandlers.push(errorHandler)
    },

  }

  return r
}

/** @param {string[]} paths */
function joinpaths(...paths) {
  return paths.join('/').replaceAll('//', '/').replaceAll('//', '/')
}
