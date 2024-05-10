import * as http from 'node:http'
import { requestListener } from '../request-listener.js'
import { router } from '../handlers/router.js'


export function createServer() {
  const httpServer = http.createServer(requestListener)
  const mainRouter = router()
  mainRouter.localPath = '/'
  mainRouter.parent = 'ROOT'
  const server = Object.assign(httpServer, mainRouter) // patch http server
  return server
}
