import * as esma from 'esma'
import { router2 } from './router2.js'
const r = esma.router()
export { r as router1 }

r.use('/route2', router2)

r.get('/path1', req => 'ok-path1')