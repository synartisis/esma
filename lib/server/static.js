import fs from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import * as mime from '../deps/mime.js'
import { getEtag } from './utils.js'


export { serveStatic as static }
function serveStatic(root, {
  dotfiles = 'ignore',
  etag = true,
  extensions = null,
  index = 'index.html',
  lastModified = true,
  maxAge = -1, // must by 0 when implemented
  redirect = true,
}) {
  return async function(req, res) {
    const reqPath = path.join(root, req.url.split('?')[0])
    try {
      let filename = reqPath
      let stat = await tryStat(filename)
      // console.debug({ reqPath }, stat.isDirectory(), path.basename(reqPath))
      if (stat?.isDirectory()) {
        if (redirect && !req.originalUrl.endsWith('/')) return redirectTo(req, res, req.originalUrl + '/')
        if (index) {
          filename = path.join(reqPath, index)
          stat = await tryStat(filename)
        }
      }
      if (!stat && extensions) {
        for (const ext of extensions) {
          stat = await tryStat(filename + '.' + ext)
          if (stat) {
            filename += '.' + ext
            break
          }
        }
      }
      if (lastModified) res.setHeader('Last-Modified', new Date(stat.mtime).toUTCString())
      if (!stat) return null
      let basename = path.basename(filename)
      if (basename.startsWith('.')) {
        if (dotfiles === 'deny') return { http: { statusCode: 403 } }
        if (dotfiles === 'ignore') return null
      }
      if (etag) {
        const eTag = getEtag(stat, 'weak')
        if (eTag) res.setHeader('ETag', eTag)
      }
      if (maxAge !== -1) throw Error('[static]: maxAge not implemented')
      
      res.setHeader('Content-Type', mime.getType(filename))
      // console.debug('*****', filename, isParseable(filename), mime.getType(filename))
      if (isParseable(filename)) {
        const content = await fs.readFile(filename, 'utf8')
        return content
      } else {
        const stream = createReadStream(filename)
        stream.pipe(res)
        return new Promise(resolve => stream.on('end', () => resolve('done')))
      }
    } catch (err) {
      console.error(err)
    }
  }
}


function isParseable(filename) {
  return ['.html', '.css', '.js'].includes(path.extname(filename))
}

// function getMimeType(ext) {
//   const mimeTypes = {
//     '.html': 'text/html',
//     '.css': 'text/css',
//     '.js': 'application/javascript',
//   }
//   return mimeTypes[ext] || 'text/html'
// }

function redirectTo(req, res, loc) {
  res.writeHead(302, {
    'Location': loc
  }).end()
}

async function tryStat(filename) {
  try {
    return await fs.stat(filename)
  } catch (error) {
    return null
  }
}