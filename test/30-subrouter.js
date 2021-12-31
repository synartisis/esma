import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()
const r = utils.getSubrouter()
server.use('/sub', r)

describe('subrouter', () => {

  it('should respond only on mountpoint', async () => {
    r.get('/test', req => 'ok')
    const res1 = await utils.get('/sub/test')
    const res2 = await utils.get('/test')
    assert.equal(res1.statusCode, 200)
    assert.equal(res1.body, 'ok')
    assert.equal(res2.statusCode, 404)
  })

  it('should set url, baseUrl, originalUrl', async () => {
    r.get('/paths', req => {
      const { url, baseUrl, originalUrl } = req
      return { url, baseUrl, originalUrl }
    })
    const res = await utils.get('/sub/paths')
    assert.equal(res.body, JSON.stringify({ url: '/paths', baseUrl: '/sub', originalUrl: '/sub/paths' }))
  })

})