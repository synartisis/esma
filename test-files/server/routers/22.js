import * as esma from 'esma'
const r = esma.router()
export { r as r22 }


r.get('/query', async req => req.query)

r.get('/params/:p1/static/:p2', async req => req.params)

r.post('/bodyparse-json', async req => req.body)

r.post('/bodyparse-urlencoded', async req => req.body)

r.post('/bodyparse-formdata', async req => req.body)
