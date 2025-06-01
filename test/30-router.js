import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'


describe('router - use', () => {

  it('should accept multiple middleware functions', async () => {
    const res = await fetch(global.url + '/30/route2')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), '2')
  })

  it('should mount only to subpaths of mountpath', async () => {
    const res0 = await fetch(global.url + '/30/route3')
    const res1 = await fetch(global.url + '/30/route3/subpath')
    const res2 = await fetch(global.url + '/30/route3-path')
    assert.strictEqual(await res0.text(), 'route3 result')
    assert.strictEqual(await res1.text(), 'route3 result')
    assert.strictEqual(res2.status, 404, 'this is not a subpath of router\'s mountpath')
  })

  it('should change path to / if it is missing', async () => {
    const res = await fetch(global.url + '/30/check-missing-path')
    assert.strictEqual(await res.json(), true)
  })

  it('should ignore METHOD middleware if path is missing', async () => {
    const res = await fetch(global.url + '/30/')
    assert.notStrictEqual(await res.text(), 'check METHOD without path')
  })

})
