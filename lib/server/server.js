import * as http from 'node:http'
import { requestListener } from './request-listener.js'
import { mainRouter } from './router.js'


/** @typedef {import('../types.js').esma.Server} esma.Server */


/** @return {esma.Server} */
export function createServer() {
  const httpServer = http.createServer(requestListener)
  const server = Object.assign(httpServer, mainRouter) // patch http server
  return server
}
