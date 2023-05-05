import { promises as fs } from 'node:fs'  // import * as fs from 'node:fs/promises' does not work
import { createReadStream } from 'node:fs'
import * as path from 'node:path'
import * as mime from '../deps/mime.js'
import { getEtag } from './utils.js'
import * as files from './files.js'

const reCacheBusting = /(.+)\.(?:[A-Fa-f0-9]{6})\.(jpg|jpeg|png|gif|svg|ico|woff|ttf|css|js|mjs)$/

/** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma').Middleware} Middleware */
/** @typedef {import('esma').StaticFileHandler} StaticFileHandler */
/** @typedef {import('esma').StaticOptions} StaticOptions */


/** @type {StaticOptions} */
const defaultOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: [],
  index: 'index.html',
  lastModified: true,
  maxAge: 0,
  redirect: true,
  cacheBusting: true,
  parsers: {},
}


/** @type {(root: string, options?: Partial<StaticOptions>) => Middleware} */
export function serveStatic(root, options) {
  files.createParametricIndex(path.normalize(root))
  const {
    dotfiles = 'ignore',
    etag = true,
    extensions = null,
    index = 'index.html',
    lastModified = true,
    maxAge = 0,
    redirect = true,
    cacheBusting = true,
    parsers = {}
  } = options ?? {}

  return async function(req, res) {    
    let fileUrl = path.join(root, req.url.split('?')[0])
    const file = await files.getFile(fileUrl)
    let filename = file?.fname ?? fileUrl

    let stat = await tryStat(filename)

    if (stat?.isDirectory()) {
      if (redirect && !req.originalUrl.split('?')[0].endsWith('/'))  return redirectTo(res, req.originalUrl + '/')
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
    // parametric filenames
    if (!stat) {
      const { dynFile, value } = files.getParametricFile(filename) ?? {}
      if (dynFile) {
        filename = dynFile.name
        res.locals[dynFile.param] = value
        stat = await tryStat(filename)
      }
    }

    if (!stat) return undefined

    if (!file) files.setFile({ url: fileUrl, fname: filename })

    const basename = path.basename(filename)
    if (basename.startsWith('.')) {
      if (dotfiles === 'deny') return { $statusCode: 403 }
      if (dotfiles === 'ignore') return undefined
    }
    if (lastModified) res.setHeader('Last-Modified', new Date(stat.mtime).toUTCString())
    if (etag) {
      const eTag = getEtag(stat, 'weak')
      if (eTag) res.setHeader('ETag', eTag)
    }
    if (maxAge !== 0) res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
    
    let contentType = mime.getType(filename) ?? ''
    const fileParsers = getFileParsers(parsers, filename)
    if (fileParsers.length > 0) {
      let content = await fs.readFile(filename, 'utf8')
      for (const parser of fileParsers) {
        if (parser.length !== 3) throw Error(`[esma-static] parser for ${contentType} has wrong signature. Must be (content, filename, context) => newContent`)
        if (contentType) res.setHeader('Content-Type', contentType + '; charset=utf-8')
        content = await parser(content, filename, res.locals)
      }
      const parseResult = content ?? ''
      res.setHeader('Content-Length', Buffer.from(parseResult).byteLength)
      return parseResult
    } else {
      if (contentType.startsWith('text')) contentType += '; charset=utf-8'
      if (contentType) res.setHeader('Content-Type', contentType)
      const stream = createReadStream(filename)
      stream.pipe(res)
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve('done'))
        stream.on('error', reject)
      })
    }
  }
}


/** @type {(parsers: { [key: string]: StaticFileHandler | StaticFileHandler[] | undefined}, filename: string) => StaticFileHandler[]} */
function getFileParsers(parsers, filename) {
  const ext = filename.split('.').pop() ?? ''
  const parsersFound = parsers[ext]
  if (!parsersFound) return []
  if (!Array.isArray(parsersFound)) return [ parsersFound ]
  return parsersFound
}


/**
 * @param {Response} res 
 * @param {string} loc 
 */
function redirectTo(res, loc) {
  res.writeHead(302, {
    'Location': loc
  }).end()
}


/** @param {string} filename */
async function tryStat(filename) {
  try {
    return await fs.stat(filename)
  } catch (error) {
    return null
  }
}