import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30020
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

describe('router - use', () => {

  it('should add middleware', async () => {
    server.use('/route1', async req => {
      req.view.data = 1
    })
    server.use('/route1', async req => {
      assert.strictEqual(typeof req.view.data, 'number')
      if (typeof req.view.data !== 'number') assert.fail('wrong assignment to req.view object')
      req.view.data += 1
      return req.view.data
    })
    const res1 = await fetch(url + '/route1')
    const res2 = await fetch(url + '/route2')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), '2')
    assert.strictEqual(res2.status, 404)
  })

  it('should accept multiple middleware functions', async () => {
    server.use('/route2', 
      req => { req.view.data = 1 }, 
      req => {
        if (typeof req.view.data !== 'number') {
          assert.fail('wrong assignment to req.view object');
        }
        return ++req.view.data
      }
    )
    const res = await fetch(url + '/route2')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), '2')
  })

  it('should mount only to subpaths of mountpath', async () => {
    server.use('/route3', req => 'route3 result')
    const res0 = await fetch(url + '/route3')
    const res1 = await fetch(url + '/route3/subpath')
    const res2 = await fetch(url + '/route3-path')
    assert.strictEqual(await res0.text(), 'route3 result')
    assert.strictEqual(await res1.text(), 'route3 result')
    assert.strictEqual(res2.status, 404, 'this is not a subpath of router\'s mountpath')
  })

  it('should change path to / if it is missing', async () => {
    server.use(req => { req.bag.missingPath = true })
    server.use('/check-missing-path', req => req.bag.missingPath)
    const res = await fetch(url + '/check-missing-path')
    assert.strictEqual(await res.text(), 'true')
  })

  it('should ignore METHOD middleware if path is missing', async () => {
    // @ts-expect-error
    server.get(req => 'check METHOD without path')
    const res = await fetch(url + '/')
    assert.strictEqual(res.status, 404)
  })

  after(() => {
    server.close()
  })

})
