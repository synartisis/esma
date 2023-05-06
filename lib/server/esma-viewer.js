import * as http from 'node:http'
import { mainRouter } from './router.js'
import * as files from './files.js'


const router = [
  { url: '/esma/', handler: root },
  { url: '/esma/ls', handler: ls },
  { url: '/esma/routes', handler: routes },
  { url: '/esma/files', handler: filesHandler },
]



/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
export function esmaViewer(req, res) {
  const route = router.find(o => o.url === req.url)
  if (route) return route.handler(req, res)

  if (req.url === '/esma/files') {
    return res.end()
  }
  return res.end('esma: not found')
}


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function root(req, res) {
  return res.end(htmlIt(res, `<a href="ls">ls</a><br><a href="routes">routes</a><br><a href="files">files</a>`))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function ls(req, res) {
  return res.end(JSON.stringify(mainRouter.middleware.map(o => ({...o, urlPattern: null})), null, 2))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function routes(req, res) {
  return res.end(htmlIt(res, '<table><tr><td>' + walkRoutes(mainRouter).map(o => [o.method, o.path, o.content].join('</td><td>')).join('</td></tr><tr><td>') + '</td></tr></table>'))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function filesHandler(req, res) {
  return res.end(files.fileIndex.map(o => o.fname).join('\n') + '\n')
}




/** @type {(parrent: import('esma/private').RouterObject, routes?: any[]) => any[]} */
function walkRoutes(parrent, routes=[]) {
  if (Array.isArray(parrent.middleware)) {
    for (const middleware of parrent.middleware) {
      const entry = { path: (middleware.router.mountpath + middleware.path).replace('//', '/'), method: middleware.method, content: '' }
      routes.push(entry)
      for (const handler of middleware.handlers) {
        if ('type' in handler && handler.type === 'router') {
          entry.content += 'ROUTER'
          walkRoutes(handler, routes)
        } else {
          entry.content += handler.toString().substring(0, 100) + '<br>'
        }
      }
    }
  }
  return routes
}



/** @type {(res: http.ServerResponse, content: string) => string} */
function htmlIt(res, content) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return `<!DOCTYPE html><html lang="en"><head></head><body>${content}</body></html>`
}