import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from 'esma'
const port = 30020
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

describe('request-listener', () => {

  it('should add middleware', async () => {
    server.use('/route1', async req => {
      req.view.data = 1
    })
    server.use('/route1', async req => {
      if (typeof req.view.data !== 'number') assert.fail('wrong assignment to req.view object')
      req.view.data += 1
      return req.view.data
    })
    const res1 = await fetch(url + '/route1')
    const res2 = await fetch(url + '/route2-not-exist')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), '2')
    assert.strictEqual(res2.status, 404)
  })

  it('should share view object on req and res', async () => {
    server.get('/view', (req, res) => {
      req.view.test1 = 'test1 value'
      assert.strictEqual(res.view.test1, 'test1 value')
      return 'ok'
    })
    const resp = await fetch(url + '/view')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })

  it('should share bag object on req and res', async () => {
    server.get('/bag', (req, res) => {
      const testObject = { a: 1, b: { c: true }  }
      req.bag.test1 = testObject
      assert.deepEqual(res.bag.test1, testObject)
      return 'ok'
    })
    const resp = await fetch(url + '/bag')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })

  it('should add multiple handlers - same middleware', async () => {
    server.get('/multiple1',
      req => { req.bag.test1 = 1 },
      req => { req.bag.test1 += 1 },
      req => { req.bag.test1 += 1; return req.bag.test1 },
    )
    const body = await fetch(url + '/multiple1').then(o => o.text())
    assert.strictEqual(body, '3')
  })

  it('should add multiple handlers - different middleware', async () => {
    server.get('/multiple2', req => { req.bag.test1 = 1 })
    server.get('/multiple2', req => { req.bag.test1 += 1; return req.bag.test1 })
    const body = await fetch(url + '/multiple2').then(o => o.text())
    assert.strictEqual(body, '2')
  })

  it('should return HTTP 404 only if there is no registered route', async () => {
    server.get('/handled', req => {})
    const res1 = await fetch(url + '/handled')
    const res2 = await fetch(url + '/unhandled-not-existed-route')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), '')
    assert.strictEqual(res2.status, 404)
  })

  it('should return on first route that returns something', async () => {
    server.get('/test-return', req => { req.bag.check = 1 })
    server.get('/test-return', req => { req.bag.check += 1; return 'test 1:' + req.bag.check })
    server.get('/test-return', req => { req.bag.check += 1; return 'test 2:' + req.bag.check })
    const res1 = await fetch(url + '/test-return')
    assert.strictEqual(await res1.text(), 'test 1:2')
  })

  after(() => {
    server.close()
  })

})
