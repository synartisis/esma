import http from 'http'
import { requestListener } from './request-listener.js'
import { router, mainRouter } from './router.js'
export { static as staticServer } from './static.js'
export { router }


/** @return {esma.Server} */
export function createServer() {
  const httpServer = http.createServer(requestListener)
  const server = Object.assign(httpServer, mainRouter) // patch http server
  return server
}
