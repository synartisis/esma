import { createServer as _createServer } from './server/server.js'
import { router as _router } from './server/router.js'
import { config as _config } from './esma-settings.js'
import { serveStatic as _serveStatic } from './server/static.js'
import { multilingual as _multilingual } from './server/multilingual.js'
export { serveStatic as static }
export { router as Router }


/** @typedef {import('./types.js').esma.Request} esma.Request */
/** @typedef {import('./types.js').esma.Response} esma.Response */
/** @typedef {import('./types.js').esma.MiddlewareResultObject} esma.MiddlewareResultObject */
/** @typedef {import('./types.js').esma.Server} esma.Server */
/** @typedef {import('./types.js').esma.Router} esma.Router */
/** @typedef {import('./types.js').esma.FunctionHandler} esma.FunctionHandler */
/** @typedef {import('./types.js').esma.StaticOptions} esma.StaticOptions */
/** @typedef {import('./types.js').esma.Settings} esma.Settings */



/**
 * creates an esma server instance
 * @return {esma.Server}
 * @example const server = esma.createServer()
 * */
export function createServer() {
  return _createServer()
}


/**
 * configures esma
 * @param {esma.Settings} userSettings configuration settings
 * @example esma.config({ env: 'production', etag: 'weak', bodyParserLimit: 10_000 })
 */
export function config(userSettings) {
  return _config(userSettings)
}


/**
 * serve static files
 * @param {string} root the directory to serve
 * @param {Partial<esma.StaticOptions>} options serve static options
 * @returns {esma.FunctionHandler}
 * @example server.use(esma.static(__dirname + '../client', { extensions: ['html'] }))
 */
function serveStatic(root, options) {
  return _serveStatic(root, options)
}


/**
 * esma router
 * @returns {esma.Router}
 * @example 
 * import { router } from 'esma'
 * const r = router()
 */
export function router() {
  return _router()
}


/**
 * esma multilingual functionality
 * @param {string[]} languages supported languages
 */
export function multilingual(languages) {
  return _multilingual(languages)
}