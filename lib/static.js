import fs from 'fs/promises'
import path from 'path'


export { serveStatic as static }
function serveStatic(root, options = { index: 'index.html', extensions: ['html'], redirect: true, }) {
  return async function(req, res) {
    const reqPath = path.join(root, req.url.split('?')[0])
    try {
      let filename = reqPath
      let stat = await fs.stat(filename)
      // console.log({ reqPath, stat }, stat.isDirectory())
      if (stat.isDirectory()) {
        if (options.redirect && !req.originalUrl.endsWith('/')) return redirectTo(req, res, req.originalUrl + '/')
        if (options.index) {
          filename = path.join(reqPath, options.index)
          stat = await fs.stat(filename)
        }
      }
      const content = await fs.readFile(filename, 'utf8')
      // console.log({content})
      res.setHeader('Content-Type', getMimeType(path.extname(filename)))
      res.end(content)
      return content
    } catch (err) {
      console.error(err)
    }

  }
}


function getMimeType(ext) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
  }
  return mimeTypes[ext] || 'text/html'
}

function redirectTo(req, res, loc) {
  res.writeHead(302, {
    'Location': loc
  }).end()
}