import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'

const errorMessage = '*error message*'

describe('error handling', () => {

  it('should respond to throw Error with http 500', async () => {
    const res1 = await fetch(global.url + '/50/err/plain-text')
    const res2 = await fetch(global.url + '/50/err/error-function')
    const res3 = await fetch(global.url + '/50/err/error-constractor')
    assert.equal(res1.status, 500)
    assert.equal((await res1.text()).split('\n')[0], `HTTP 500 - ${errorMessage}`)
    assert.equal(res2.status, 500)
    assert.equal((await res2.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
    assert.equal(res3.status, 500)
    assert.equal((await res3.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  it('should use error handlers', async () => {
    const res = await fetch(global.url + '/50/err/error-constractor')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

})
