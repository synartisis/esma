import http from 'http'
import * as httpPatch from './server/http-patch.js'
import { requestListener } from './server/request-listener.js'

import { router, mainRouter } from './server/router.js'
import { static as staticServer } from './server/static.js'

export default { createServer, static: staticServer }
export { router, router as Router }


/** @return {esma.Server} */
function createServer() {
  const server = http.createServer(requestListener)
  httpPatch.patchServer(server, mainRouter)
  /** @ts-ignore - Object.assign not working in typescript */
  return server
}
