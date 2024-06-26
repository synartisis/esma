import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from 'esma'
const port = 30032
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)
const router1 = esma.router()
const router2 = esma.router()
const router3 = esma.router()
const router4 = esma.router()
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

  it('should mount when used', async () => {
    router3.get('/test3', req => 'path3')
    server.use('/route3', router3)
    router2.use('/route4', router4)
    router4.get('/test4', req => 'path4')
    const res1 = await fetch(url + '/route3/test3')
    const res2 = await fetch(url + '/route1/route2/route4/test4')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(res2.status, 200)
  })

  after(() => {
    server.close()
  })

})
