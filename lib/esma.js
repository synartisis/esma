import http from 'http'
import * as httpPatch from './http-patch.js'
import { requestListener } from './request-listener.js'
import { use } from './middleware.js'
import { static as staticServer } from './static.js'

export default { createServer, static: staticServer, use }


function createServer() {
  const httpServer = http.createServer(requestListener)
  httpPatch.patchServer(httpServer)
  return httpServer
}
