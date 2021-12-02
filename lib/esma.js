import { createServer, router, staticServer } from './server/server.js'
import { setSetting } from './esma-settings.js'

export default { createServer, static: staticServer, setSetting }
export { router, router as Router }
