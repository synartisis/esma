import * as esma from 'esma'
const r = esma.router()
export { r as router31 }


r.get('/path1', req => 'ok-path1')

r.use(req => { return { $action: 'skip-router' } })

r.get('/path3', req => 'ok-path3')
