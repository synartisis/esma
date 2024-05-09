import { addHandler, errorHandlers } from "./handlers.js"

export function router() {
  /** @type {esma.RouterObject} */
  const r = {

    mountpath: '/',

    use(path, ...handlers) {
      if (typeof path !== 'string') {
        handlers = [ path, ...handlers ]
        path = '/'
      }
      const pathWithoutTrailingSlash = path !== '/' && path.endsWith('/') ? path.substring(0, path.length - 1) : path
      for (const handler of handlers) {
        if (typeof handler === 'function') {
          addHandler((this.mountpath + path).replaceAll('//', '/'), '*', (this.mountpath + path).replaceAll('//', '/'), handler)
        } else {
          handler.mountpath = (this.mountpath + path).replaceAll('//', '/')
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
        addHandler((this.mountpath + path).replaceAll('//', '/'), method, this.mountpath, handler)
      }
    },

    onerror(errorHandler) {
      errorHandlers.push(errorHandler)
    },

  }

  return r
}
