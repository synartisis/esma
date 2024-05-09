import * as http from 'node:http'
import * as files from '../middleware/files.js'
import { sessions } from '../middleware/session.js'
import { handlers } from '../handlers/handlers.js'


const router = [
  { url: '/esma/', handler: root },
  { url: '/esma/ls', handler: ls },
  { url: '/esma/routes', handler: routes },
  { url: '/esma/session', handler: session },
  { url: '/esma/files', handler: filesHandler },
]



/** @type {http.RequestListener} */
export function esmaViewer(req, res) {
  if (req.url === '/esma') { res.writeHead(302, { Location: '/esma/' }).end(); return }
  const route = router.find(o => o.url === req.url)
  if (route) { route.handler(req, res); return }
  if (req.url === '/esma/files') { res.end(); return }
  res.end(`esma: "${req.url}" not found`)
}


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function root(req, res) {
  return res.end(htmlIt(res, `<a href="ls">ls</a><br><a href="routes">routes</a><br><a href="session">session</a><br><a href="files">files</a>`))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function ls(req, res) {
  return res.end(JSON.stringify(handlers.map(o => {
    const { urlPattern, ...rest } = o
    return { ...rest, handler: o.handler.toString().substring(0, 50) }
  }), null, 2))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function routes(req, res) {
  return res.end(htmlIt(res, '<table><tr><td>' + handlers.map(o => [o.method, o.path, o.handler.toString().substring(0, 50)].join('</td><td>')).join('</td></tr><tr><td>') + '</td></tr></table>'))
}


/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function session(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.end(JSON.stringify(sessions, null, 2))
}

/** @type {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse} */
function filesHandler(req, res) {
  return res.end(files.fileIndex.map(o => o.fname).join('\n') + '\n')
}



/** @type {(res: http.ServerResponse, content: string) => string} */
function htmlIt(res, content) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return `<!DOCTYPE html><html lang="en"><head></head><body>${content}</body></html>`
}