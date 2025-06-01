import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'


describe('request-listener', () => {

  it('should add middleware', async () => {
    const res1 = await fetch(global.url + '/20/route1')
    const res2 = await fetch(global.url + '/route2-not-exist')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), '2')
    assert.strictEqual(res2.status, 404)
  })

  it('should share view object on req and res', async () => {
    const resp = await fetch(global.url + '/20/view')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })

  it('should share bag object on req and res', async () => {
    const resp = await fetch(global.url + '/20/bag')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })

  it('should add multiple handlers - same middleware', async () => {
    const body = await fetch(global.url + '/20/multiple1').then(o => o.text())
    assert.strictEqual(body, '3')
  })

  it('should add multiple handlers - different middleware', async () => {
    const body = await fetch(global.url + '/20/multiple2').then(o => o.text())
    assert.strictEqual(body, '2')
  })

  it('should return HTTP 404 only if there is no registered route', async () => {
    const res1 = await fetch(global.url + '/20/handled')
    const res2 = await fetch(global.url + '/20/unhandled-not-existed-route')
    assert.strictEqual(res1.status, 200)
    assert.strictEqual(await res1.text(), '')
    assert.strictEqual(res2.status, 404)
  })

  it('should return on first route that returns something', async () => {
    const res1 = await fetch(global.url + '/20/test-return')
    assert.strictEqual(await res1.text(), 'test 1:2')
  })

})
