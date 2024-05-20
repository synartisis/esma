import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from 'esma'
const port = 30060
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

describe('express compat', () => {

  it('should support express.js res.redirect', async () => {
    server.get('/express/redirect', (req, res) => {
      res.redirect('/express/new-location')
    })
    const res = await fetch(url + '/express/redirect', { redirect: 'manual' })
    assert.strictEqual(res.status, 302)
    assert.strictEqual(res.headers.get('location'), '/express/new-location')
  })

  after(() => {
    server.close()
  })

})
