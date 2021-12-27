import assert from 'node:assert'
import * as utils from './test-utils.js'

describe('server', () => {
  it('should create an http server', async () => {
    const server = utils.createServer()
    server.get('/endpoint1', async req => {
      return { test: true }
    })
    const res = await utils.get('/endpoint1')
    assert.equal(res, `{"test":true}`)
    server.close()
  })
})