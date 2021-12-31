import assert from 'node:assert'
import * as utils from './test-utils.js'


describe('server', () => {

  it('should create an http server', async () => {
    const server = utils.getServer()
    server.get('/ping', async req => 'pong')
    const res = await utils.get('/ping')
    assert.equal(res.body, `pong`)
  })

  it('should validate user settings', async () => {
    const defaultSettingsJson = JSON.stringify(utils.settings)
    utils.config({
      etag: 'unknown',
      bodyParserLimit: 'string'
    })
    assert.equal(JSON.stringify(utils.settings), defaultSettingsJson)
  })

})