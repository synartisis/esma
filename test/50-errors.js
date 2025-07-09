import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'

const errorMessage = '*error message*'

describe('error handling', () => {

  it('should respond to throw Error with http 500', async () => {
    let res = await fetch(global.url + '/50/err/plain-text')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - ${errorMessage}`)
    res = await fetch(global.url + '/50/err/error-function')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
    res = await fetch(global.url + '/50/err/error-constructor')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  it('should handle throw esma.HttpError', async () => {
    let res = await fetch(global.url + '/50/err/esma-error-500')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - ${errorMessage}`)
    res = await fetch(global.url + '/50/err/esma-error-400')
    assert.equal(res.status, 400)
    assert.equal((await res.text()).split('\n')[0], `HTTP 400 - ${errorMessage}`)
  })

})
