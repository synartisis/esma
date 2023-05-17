import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'
const port = 30010

describe('server', () => {

  it('should create an http server', async () => {
    const server = esma.createServer().listen(port)
    server.get('/ping', async () => 'pong')
    const res = await utils.get(port, '/ping')
    assert.strictEqual(res.body, `pong`)
    server.close()
  })

  it('should validate user settings', async () => {
    const defaultSettingsJson = JSON.stringify(utils.settings)
    utils.config({
      // @ts-expect-error
      etag: 'unknown',
      // @ts-expect-error
      bodyParserLimit: 'string instead of number'
    })
    assert.strictEqual(JSON.stringify(utils.settings), defaultSettingsJson)
  })

})