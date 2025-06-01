import assert from 'assert'
import * as esma from 'esma'
const r = esma.router()
export { r as r20 }


r.use('/route1', async req => {
  req.view.data = 1
})


r.use('/route1', async req => {
  if (typeof req.view.data !== 'number') assert.fail('wrong assignment to req.view object')
  req.view.data += 1
  return req.view.data
})


r.get('/view', (req, res) => {
  req.view.test1 = 'test1 value'
  assert.strictEqual(res.view.test1, 'test1 value')
  return 'ok'
})

r.get('/bag', (req, res) => {
  const testObject = { a: 1, b: { c: true }  }
  req.bag.test1 = testObject
  assert.deepEqual(res.bag.test1, testObject)
  return 'ok'
})

r.get('/multiple1',
  req => { req.bag.test1 = 1 },
  req => { req.bag.test1 += 1 },
  req => { req.bag.test1 += 1; return req.bag.test1 },
)

r.get('/multiple2', req => { req.bag.test1 = 1 })

r.get('/multiple2', req => { req.bag.test1 += 1; return req.bag.test1 })

r.get('/handled', req => {})

r.get('/test-return', req => { req.bag.check = 1 })
r.get('/test-return', req => { req.bag.check += 1; return 'test 1:' + req.bag.check })
r.get('/test-return', req => { req.bag.check += 1; return 'test 2:' + req.bag.check })
