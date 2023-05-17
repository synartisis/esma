import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'
const port = 30020

const server = esma.createServer().listen(port)

describe('router - use', () => {

  it('should add middleware', async () => {
    server.use('/route1', async req => {
      req.data = 1
    })
    server.use('/route1', async req => {
      req.data += 1
      return req.data
    })
    const res1 = await utils.get(port, '/route1')
    const res2 = await utils.get(port, '/route2')
    assert.strictEqual(res1.statusCode, 200)
    assert.strictEqual(res1.body, '2')
    assert.strictEqual(res2.statusCode, 404)
  })

  it('should accept multiple middleware functions', async () => {
    server.use('/route2', req => { req.data = 1 }, req => ++req.data)
    const res = await utils.get(port, '/route2')
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body, '2')
  })

  it('should mount only to subpaths of mountpath', async () => {
    server.use('/route3', req => 'route3 result')
    const res0 = await utils.get(port, '/route3')
    const res1 = await utils.get(port, '/route3/subpath')
    const res2 = await utils.get(port, '/route3-path')
    assert.strictEqual(res0.body, 'route3 result')
    assert.strictEqual(res1.body, 'route3 result')
    assert.strictEqual(res2.statusCode, 404, 'this is not a subpath of router\'s mountpath')
  })

  it('should change path to / if it is missing', async () => {
    server.use(req => { req.missingPath = true })
    server.use('/check-missing-path', req => req.missingPath)
    const res = await utils.get(port, '/check-missing-path')
    assert.strictEqual(res.body, 'true')
  })

  it('should ignore METHOD middleware if path is missing', async () => {
    server.get(req => 'check METHOD without path')
    const res = await utils.get(port, '/')
    assert.strictEqual(res.statusCode, 404)
  })

  after(() => {
    server.close()
  })

})
