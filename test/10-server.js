import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as esma from 'esma'
import { settings } from '../lib/esma-settings.js'
const port = 30010
const url = `http://localhost:${port}`

describe('server', () => {

  it('should create an http server', async () => {
    const server = esma.createServer().listen(port)
    server.get('/ping', async () => 'pong')
    const res = await fetch(url + '/ping')
    assert.strictEqual(await res.text(), `pong`)
    server.close()
  })

  it('should validate user settings', async () => {
    const defaultSettingsJson = JSON.stringify(settings)
    esma.config({
      // @ts-expect-error
      etag: 'unknown',
      // @ts-expect-error
      bodyParserLimit: 'string instead of number'
    })
    assert.strictEqual(JSON.stringify(settings), defaultSettingsJson)
  })

})