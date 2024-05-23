import * as esma from 'esma'
import { addHandler, errorHandlers } from "./handlers.js"

/**
 * @typedef {{
 *  localPath: string | null
 *  use: (pathOrHandler: string | esma.Handler | RouterObject, ...handlers: Array<esma.Handler | RouterObject>) => void
 *  _method(method: esma.HttpMethods, path: string, handlers: esma.Handler[]): void
 *  onerror(handler: esma.ErrorHandler): void
 *  handlers: { method: esma.HttpMethods | '*', path: string, handler: esma.Handler }[]
 *  parent: RouterObject | null | 'ROOT'
 *  children: RouterObject[]
 *  get mount(): string | null
 * } & {
 *  [method in esma.HttpMethods]: (path: string, ...handlers: esma.Handler[]) => void
 * }} RouterObject
*/


export function router() {
  /** @type {RouterObject} */
  const r = {

    localPath: null,
    handlers: [],
    parent: null,
    children: [],

    get mount() {
      if (this.parent === 'ROOT') return '/'  // mainRouter
      if (this.parent === null || this.parent.mount === null || this.localPath === null) return null
      return joinpaths(this.parent.mount, this.localPath)
    },

    use(path, ...handlers) {
      if (typeof path !== 'string') {
        handlers = [ path, ...handlers ]
        path = '/'
      }
      for (const handler of handlers) {
        if (typeof handler === 'function') {
          // function handler
          this.handlers.push({ method: '*', path, handler })
          if (this.mount) {
            const handlerPath = joinpaths(this.mount, path)
            addHandler(handlerPath, '*', handlerPath, handler, this)
          }
        } else {
          // router object
          const childRouter = handler
          if (childRouter.mount) throw new Error(`cannot mount router because it is already mounted to "${childRouter.mount}"`)
          childRouter.parent = this
          this.children.push(childRouter)
          childRouter.localPath = path
          if (this.mount) {
            mountRouter(childRouter)
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
        if (this.mount) {
          addHandler(joinpaths(this.mount, path), method, this.mount, handler, this)
        }
      }
    },

    onerror(errorHandler) {
      errorHandlers.push(errorHandler)
    },

  }

  return r
}


/** @param {RouterObject} router */
export function mountRouter(router) {
  if (!router.mount) return
  for (const handler of router.handlers) {
    const handlerPath = handler.path !== '/' ? joinpaths(router.mount, handler.path) : router.mount
    const mountPath = handler.method === '*' ? handlerPath : router.mount
    addHandler(handlerPath, handler.method, mountPath, handler.handler, router)
  }
  for (const childRouter of router.children) {
    mountRouter(childRouter)
  }
}


/** @param {string[]} paths */
function joinpaths(...paths) {
  return paths.join('/')
    .replaceAll('//', '/').replaceAll('//', '/')  // remove possible double slashes
}
