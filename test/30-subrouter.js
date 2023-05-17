import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'
const port = 30030

const server = esma.createServer().listen(port)
const r = esma.router()
server.use('/sub', r)

describe('subrouter', () => {

  it('should respond only on mountpoint', async () => {
    r.get('/test', req => 'ok')
    const res1 = await utils.get(port, '/sub/test')
    const res2 = await utils.get(port, '/test')
    assert.strictEqual(res1.statusCode, 200)
    assert.strictEqual(res1.body, 'ok')
    assert.strictEqual(res2.statusCode, 404)
  })

  it('should set url, baseUrl, originalUrl', async () => {
    r.get('/paths', req => {
      const { url, baseUrl, originalUrl } = req
      return { url, baseUrl, originalUrl }
    })
    const res = await utils.get(port, '/sub/paths')
    assert.strictEqual(res.body, JSON.stringify({ url: '/paths', baseUrl: '/sub', originalUrl: '/sub/paths' }))
  })

  after(() => {
    server.close()
  })

})
