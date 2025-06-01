import * as esma from 'esma'
const r = esma.router()
export { r as router4 }

r.get('/url', req => {
  return { url: req.url, originalUrl: req.originalUrl }
})

r.get('/params/:p1/static/:p2', req => {
  const { p1, p2 } = req.params
  return { p1, p2, check: req.bag.check }
})

r.get('/query', req => {
  const { q1, q2 } = req.query
  return { q1, q2 }
})

