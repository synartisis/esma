import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import { server } from '../test-files/project/server/server.js'
const port = 30090
const url = `http://localhost:${port}`

server.listen(port)

describe('typical project', () => {

  it('should use middleware', async () => {
    const res = await fetch(url + '/middleware')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.json(), true)
  })

  it('should use routers', async () => {
    const res1 = await fetch(url + '/route1/path1')
    const res2 = await fetch(url + '/route1/route2/path2')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), 'ok-path1')
    assert.strictEqual(res2.status, 200)
    assert.strictEqual(await res2.text(), 'ok')
  })

  it('should serve static files', async () => {
    const res1 = await fetch(url + '/')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(res1.headers.get('content-type'), 'text/html; charset=utf-8')
    const res2 = await fetch(url + '/assets/styles.css')
    assert.strictEqual(res2.status, 200)
    assert.strictEqual(res2.headers.get('content-type'), 'text/css; charset=utf-8')
  })

  it(`should support $action: 'skip-router'`, async () => {
    const res1 = await fetch(url + '/route31/path1')
    const res2 = await fetch(url + '/route31/path3')
    const res3 = await fetch(url + '/route32/path1')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(res2.status, 404)
    assert.strictEqual(res3.status, 200)
  })

  after(() => {
    server.close()
  })

})