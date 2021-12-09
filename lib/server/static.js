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
} = {}) {
  return async function(req, res) {
    let filename = path.join(root, req.url.split('?')[0])
    let stat = await tryStat(filename)
    if (stat?.isDirectory()) {
      if (redirect && !req.originalUrl.endsWith('/')) return redirectTo(req, res, req.originalUrl + '/')
      if (index) {
        filename = path.join(filename, index)
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
    if (!stat) return null

    let basename = path.basename(filename)
    if (basename.startsWith('.')) {
      if (dotfiles === 'deny') return { $statusCode: 403 }
      if (dotfiles === 'ignore') return null
    }
    if (lastModified) res.setHeader('Last-Modified', new Date(stat.mtime).toUTCString())
    if (etag) {
      const eTag = getEtag(stat, 'weak')
      if (eTag) res.setHeader('ETag', eTag)
    }
    if (maxAge !== -1) throw Error('[static]: maxAge not implemented')
    
    let contentType = mime.getType(filename)
    if (isParseable(filename)) {
      const buffer = await fs.readFile(filename)
      res.setHeader('Content-Type', contentType + '; charset=utf-8')
      res.setHeader('Content-Length', buffer.byteLength)
      return buffer.toString()
    } else {
      res.setHeader('Content-Type', contentType)
      const stream = createReadStream(filename)
      stream.pipe(res)
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve('done'))
        stream.on('error', reject)
      })
    }
  }
}


function isParseable(filename) {
  return ['.html', '.css', '.js'].includes(path.extname(filename))
}

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