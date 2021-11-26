import http from 'http'
import * as httpPatch from './http-patch.js'
import { requestListener } from './request-listener.js'

import { router, mainRouter } from './router.js'
import { static as staticServer } from './static.js'

export default { createServer, static: staticServer }
export { router }


function createServer() {
  const httpServer = http.createServer(requestListener)
  httpPatch.patchServer(httpServer, mainRouter)
  return httpServer
}
