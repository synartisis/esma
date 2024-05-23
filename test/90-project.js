import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import { server } from '../test-files/project/server/server.js'
const port = 30090
const url = `http://localhost:${port}`


describe('typical project', () => {

  it('should use middleware', async () => {
    const res = await fetch(url + '/check-middleware')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.json(), true)
  })

  it('should use routers', async () => {
    let res = await fetch(url + '/route1/path1')
    assert.strictEqual(res.status, 200)
    assert.deepStrictEqual(await res.json(), ['ok-path1', true])
    res = await fetch(url + '/route1/route2/path2')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), 'ok')
  })

  it('should serve static files', async () => {
    let res = await fetch(url + '/')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('content-type'), 'text/html; charset=utf-8')
    res = await fetch(url + '/assets/styles.css')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('content-type'), 'text/css; charset=utf-8')
  })

  it(`should support $action: 'skip-router'`, async () => {
    let res = await fetch(url + '/route31/path1')
    assert.strictEqual(res.status, 200)
    res = await fetch(url + '/route31/path3')
    assert.strictEqual(res.status, 404)
    res = await fetch(url + '/route32/path1')
    assert.strictEqual(res.status, 200)
  })

  it('url', async () => {
    let res = await fetch(url + '/route4/url')
    let body = await res.json()
    assert.deepStrictEqual(body, { url: '/url', originalUrl: '/route4/url' })
  })

  it(`params`, async () => {
    let res = await fetch(url + '/route4/params/value1')
    assert.strictEqual(res.status, 404)
    res = await fetch(url + '/route4/params/value1/static/')
    assert.strictEqual(res.status, 404)
    res = await fetch(url + '/route4/params/value1/Static/value2')
    assert.strictEqual(res.status, 404)
    res = await fetch(url + '/route4/params/value1/static/value2')
    assert.strictEqual(res.status, 200)
    let body = await res.json()
    assert.deepStrictEqual(body, { p1: 'value1', p2: 'value2', check: true })
    res = await fetch(url + '/route4/params/value1/static/value2/')
    assert.strictEqual(res.status, 404)
  })

  it(`query`, async () => {
    let res = await fetch(url + '/route4/query')
    assert.strictEqual(res.status, 200)
    let body = await res.json()
    assert.deepStrictEqual(body, {})
    res = await fetch(url + '/route4/query?q1=value1')
    body = await res.json()
    assert.deepStrictEqual(body, { q1: 'value1' })
    res = await fetch(url + '/route4/query?q1=value1&q2')
    body = await res.json()
    assert.deepStrictEqual(body, { q1: 'value1', q2: '' })
    res = await fetch(url + '/route4/query?q1=value1&q2=value2')
    body = await res.json()
    assert.deepStrictEqual(body, { q1: 'value1', q2: 'value2' })
    res = await fetch(url + '/route4/query?q1=value1&q2=value2#/anchorUrl')
    body = await res.json()
    assert.deepStrictEqual(body, { q1: 'value1', q2: 'value2' })
  })

  after(() => {
    server.close()
  })

})