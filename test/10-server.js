import assert from 'node:assert'
import * as utils from './test-utils.js'


describe('server', () => {

  it('should create an http server', async () => {
    const server = utils.getServer()
    server.get('/ping', async req => {
      return 'pong'
    })
    const res = await utils.get('/ping')
    assert.equal(res.body, `pong`)
  })

})