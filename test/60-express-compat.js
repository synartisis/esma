import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'


describe('express compat', () => {

  it('should support express.js res.redirect', async () => {
    const res = await fetch(global.url + '/60/express/redirect', { redirect: 'manual' })
    assert.strictEqual(res.status, 302)
    assert.strictEqual(res.headers.get('location'), '/express/new-location')
  })

})
