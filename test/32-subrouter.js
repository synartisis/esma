import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30032
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)
const router1 = esma.router()
const router2 = esma.router()
server.use('/route1', router1)
router1.use('/route2', router2)

describe('subrouter', () => {

  it('should respond only on mountpoint', async () => {
    router1.get('/test', req => 'ok')
    const res1 = await fetch(url + '/route1/test')
    const res2 = await fetch(url + '/test')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), 'ok')
    assert.strictEqual(res2.status, 404)
  })

  it('should set url, originalUrl', async () => {
    router1.get('/paths1', req => {
      const { url, originalUrl } = req
      return { url, originalUrl }
    })
    const res = await fetch(url + '/route1/paths1')
    assert.deepStrictEqual(await res.json(), { url: '/paths1', originalUrl: '/route1/paths1' })
  })

  it('should set url, originalUrl to subrouter', async () => {
    router2.get('/paths2', req => {
      const { url, originalUrl } = req
      return { url, originalUrl }
    })
    const res = await fetch(url + '/route1/route2/paths2')
    assert.deepStrictEqual(await res.json(), { url: '/paths2', originalUrl: '/route1/route2/paths2' })
  })

  after(() => {
    server.close()
  })

})
