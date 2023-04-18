import { createServer, router, staticServer } from './server/server.js'
import { config } from './esma-settings.js'

export default { createServer, static: staticServer, config }
export { createServer, staticServer as static, config }
export { router, router as Router }
export { multilingual } from './server/multilingual.js'