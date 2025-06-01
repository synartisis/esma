import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'


describe('subrouter', () => {

  it('should respond only on mountpoint', async () => {
    const res1 = await fetch(global.url + '/32/route1/test')
    const res2 = await fetch(global.url + '/32/test')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), 'ok')
    assert.strictEqual(res2.status, 404)
  })

  it('should set url, originalUrl', async () => {
    const res = await fetch(global.url + '/32/route1/paths1')
    assert.deepStrictEqual(await res.json(), { url: '/paths1', originalUrl: '/32/route1/paths1' })
  })

  it('should set url, originalUrl to subrouter', async () => {
    const res = await fetch(global.url + '/32/route1/route2/paths2')
    assert.deepStrictEqual(await res.json(), { url: '/paths2', originalUrl: '/32/route1/route2/paths2' })
  })

  it('should mount when used', async () => {
    const res1 = await fetch(global.url + '/32/route3/test3')
    const res2 = await fetch(global.url + '/32/route1/route2/route4/test4')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(res2.status, 200)
  })

})
