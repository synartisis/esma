import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import * as mime from '../deps/mime.js'
import { getEtag } from './utils.js'
import * as files from './files.js'

const reCacheBusting = /(.+)\.(?:[A-Fa-f0-9]{6})\.(jpg|jpeg|png|gif|svg|ico|woff|ttf|css|js|mjs)$/


export { serveStatic as static }
function serveStatic(root, {
  dotfiles = 'ignore',
  etag = true,
  extensions = null,
  index = 'index.html',
  lastModified = true,
  maxAge = -1, // must by 0 when implemented
  redirect = true,
  cacheBusting = true,
  parsers = {},
} = {}) {
  return async function(req, res) {
    
    let fileUrl = path.join(root, req.url.split('?')[0])
    const file = await files.getFile(fileUrl)
    let filename = file?.fname ?? fileUrl

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
    if (!stat && cacheBusting) {
      if (reCacheBusting.test(filename)) {
        filename = filename.replace(reCacheBusting, '$1.$2')
        stat = await tryStat(filename)
        if (stat) res.setHeader('Cache-Control', 'max-age=31536000, immutable')
      }
    }
    const basename = path.basename(filename)


    /* TODO: Parametric filenames: Needs improvement */
    const dirname = path.dirname(filename)
    if (!stat) {
      const filenames = (await fs.readdir(dirname)).filter(fn => fn.includes('__'))
      let paramName, paramValue
      if (filenames.length) {
        let reParamName = '__(.+)__'
        if (extensions) reParamName += '(.(' + extensions.join('|') + '))?'
        for (const fn of filenames) {
          const reParamNameResult = new RegExp(reParamName).exec(fn)
          if (reParamNameResult) {
            paramName = reParamNameResult[1]
            let reParamValue = fn.replace(/__(.+)__/, '(.+)')
            const ext = fn.split('.').pop()
            if (extensions.includes(ext)) reParamValue = reParamValue.replace('.' + ext, '')
            const reParamValueResult = new RegExp(reParamValue).exec(basename)
            if (reParamValueResult) {
              paramValue = reParamValueResult[1]
              res.locals[paramName] = paramValue
              filename = dirname + '/' + fn
              stat = await tryStat(filename)
              break
            }
          }
        }
      }
      // console.debug('-', { paramName, paramValue})
    }
    /* TODO: Needs improvement */

    if (!stat) return null

    if (!file) files.setFile({ url: fileUrl, fname: filename })

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
    const parser = getParser(parsers, filename)
    if (parser) {
      if (parser.length !== 3) throw Error(`[esma-static] parser for ${contentType} has wrong signature. Must be (html, filename, context) => html`)
      const content = await fs.readFile(filename, 'utf8')
      res.setHeader('Content-Type', contentType + '; charset=utf-8')
      const parseResult = await parser(content, filename, res.locals)
      res.setHeader('Content-Length', Buffer.from(parseResult).byteLength)
      return parseResult
    } else {
      if (contentType.startsWith('text')) contentType += '; charset=utf-8'
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


function getParser(parsers, filename) {
  const ext = filename.split('.').pop()
  return parsers[ext]
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