import * as esma from 'esma'
const r = esma.router()
export { r as router2 }

r.get('/path2', req => 'ok')
