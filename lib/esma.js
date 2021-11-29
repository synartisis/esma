import http from 'http'
import * as httpPatch from './http-patch.js'
import { requestListener } from './request-listener.js'

import { router, mainRouter } from './router.js'
import { static as staticServer } from './static.js'

export default { createServer, static: staticServer }
export { router, router as Router }


/** @return {Server} */
function createServer() {
  const httpServer = http.createServer((req, res) => {})
  // const httpServer = http.createServer(requestListener)
  const esmaServer = Object.assign(httpServer, mainRouter)

  // httpPatch.patchServer(esmaServer, httpServer, mainRouter)
  return esmaServer
}
