import http from 'http'
import { requestListener } from './request-listener.js'
import { router, mainRouter } from './router.js'
export { static as staticServer } from './static.js'
export { router }


/** @return {esma.Server} */
export function createServer() {
  /** @ts-ignore - Object.assign not working in typescript */
  const server = http.createServer(requestListener)
  Object.assign(server, mainRouter) // patch server
  /** @ts-ignore - Object.assign not working in typescript */
  return server
}
