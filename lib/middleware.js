export const middleware = []


export function use(path, ...handlers) {
  if (typeof path === 'function') {
    handlers = [ path, ...handlers ]
    path = null
  }
  const mdEntry = {
    path,
    handlers,
    test(url) {
      if (!this.path) return true
      return url.startsWith(this.path)
    },
  }
  // console.log({mdEntry})
  middleware.push(mdEntry)
}

