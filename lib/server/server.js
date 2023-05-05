import * as http from 'node:http'
import { requestListener } from './request-listener.js'
import { mainRouter } from './router.js'


export function createServer() {
  const httpServer = http.createServer(requestListener)
  const server = Object.assign(httpServer, mainRouter) // patch http server
  return server
}
