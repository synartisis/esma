import { createServer, router, staticServer } from './server/server.js'
import { config } from './esma-settings.js'

export default { createServer, static: staticServer, config }
export { router, router as Router }
