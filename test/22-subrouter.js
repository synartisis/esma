import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30022
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)
const r = esma.router()
const subRouter = esma.router()
server.use('/sub', r)
r.use('/sub2', subRouter)

describe('subrouter', () => {

  it('should respond only on mountpoint', async () => {
    r.get('/test', req => 'ok')
    const res1 = await fetch(url + '/sub/test')
    const res2 = await fetch(url + '/test')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), 'ok')
    assert.strictEqual(res2.status, 404)
  })

  it('should set url, baseUrl, originalUrl', async () => {
    r.get('/paths', req => {
      const { url, baseUrl, originalUrl } = req
      return { url, baseUrl, originalUrl }
    })
    const res = await fetch(url + '/sub/paths')
    assert.strictEqual(await res.text(), JSON.stringify({ url: '/paths', baseUrl: '/sub', originalUrl: '/sub/paths' }))
  })

  it('should set url, baseUrl, originalUrl to subrouter', async () => {
    subRouter.get('/paths', req => {
      const { url, baseUrl, originalUrl } = req
      return { url, baseUrl, originalUrl }
    })
    const res = await fetch(url + '/sub/sub2/paths')
    assert.strictEqual(await res.text(), JSON.stringify({ url: '/paths', baseUrl: '/sub/sub2', originalUrl: '/sub/sub2/paths' }))
  })

  after(() => {
    server.close()
  })

})
