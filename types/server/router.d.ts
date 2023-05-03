export function router(): import("../types.js").esma.Router;
/** @typedef {import('../types.js').esma.Router} esma.Router */
/** @typedef {import('../types.js').esma.Request} esma.Request */
/** @typedef {import('../types.js').esma.Handler} esma.Handler */
/** @typedef {import('../types.js').esma.Middleware} esma.Middleware */
/** @typedef {import('../types.js').esma.ErrorHandler} esma.ErrorHandler */
export const mainRouter: import("../types.js").esma.Router;
/** @type {esma.ErrorHandler[]} */
export const errorStack: esma.ErrorHandler[];
export namespace esma {
    type Router = import('../types.js').esma.Router;
    type Request = import('../types.js').esma.Request;
    type Handler = import('../types.js').esma.Handler;
    type Middleware = import('../types.js').esma.Middleware;
    type ErrorHandler = import('../types.js').esma.ErrorHandler;
}
