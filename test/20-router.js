import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()

describe('router - use', () => {

  it('should add middleware', async () => {
    server.use('/route1', async req => {
      req.data = 1
    })
    server.use('/route1', async req => {
      req.data += 1
      return req.data
    })
    const res = await utils.get('/route1')
    assert.equal(res.body, '2')
  })

  it('should accept multiple middleware functions', async () => {
    server.use('/route2', req => { req.data = 1 }, req => ++req.data)
    const res = await utils.get('/route2')
    assert.equal(res.body, '2')
  })

  it('should mount only to subpaths of mountpath', async () => {
    server.use('/route3', req => 'route3 result')
    const res1 = await utils.get('/route3/subpath')
    const res2 = await utils.get('/route3-path')
    assert.equal(res1.body, 'route3 result')
    assert.equal(res2.statusCode, '404')
  })

})