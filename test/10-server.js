import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as esma from 'esma'
import { settings } from '../lib/esma-settings.js'


describe('server', () => {

  it('should create an http server', async () => {
    const newServer = esma.createServer().listen(30011)
    newServer.get('/ping', async () => 'pong')
    const res1 = await fetch(`http://localhost:30011/ping`)
    assert.strictEqual(await res1.text(), `pong`)
    newServer.close()
    assert.rejects(() => fetch(`http://localhost:30011/ping`))
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