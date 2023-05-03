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
export function createServer(): import("./types.js").esma.Server;
/**
 * configures esma
 * @param {esma.Settings} userSettings configuration settings
 * @example esma.config({ env: 'production', etag: 'weak', bodyParserLimit: 10_000 })
 */
export function config(userSettings: esma.Settings): void;
/**
 * esma router
 * @returns {esma.Router}
 * @example
 * import { router } from 'esma'
 * const r = router()
 */
export function router(): esma.Router;
/**
 * esma multilingual functionality
 * @param {string[]} languages supported languages
 */
export function multilingual(languages: string[]): import("./types.js").esma.Handler;
export namespace esma {
    type Server = import('./types.js').esma.Server;
    type Router = import('./types.js').esma.Router;
    type FunctionHandler = import('./types.js').esma.FunctionHandler;
    type StaticOptions = import('./types.js').esma.StaticOptions;
    type Settings = import('./types.js').esma.Settings;
}
/**
 * serve static files
 * @param {string} root the directory to serve
 * @param {Partial<esma.StaticOptions>} options serve static options
 * @returns {esma.FunctionHandler}
 * @example server.use(esma.static(__dirname + '../client', { extensions: ['html'] }))
 */
declare function serveStatic(root: string, options: Partial<esma.StaticOptions>): esma.FunctionHandler;
export { serveStatic as static, _static as static, router as Router };
