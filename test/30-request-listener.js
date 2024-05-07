import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30030
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)


describe('request-listener', () => {

  it('should share view object on req and res', async () => {
    server.get('/view', (req, res) => {
      req.view.test1 = 'test1 value'
      assert.strictEqual(res.view.test1, 'test1 value')
      return 'ok'
    })
    const resp = await fetch(url + '/view')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })

  it('should share bag object on req and res', async () => {
    server.get('/bag', (req, res) => {
      const testObject = { a: 1, b: { c: true }  }
      req.bag.test1 = testObject
      assert.deepEqual(res.bag.test1, testObject)
      return 'ok'
    })
    const resp = await fetch(url + '/bag')
    if (!resp.ok) assert.fail(resp.status + ': ' + resp.statusText)
  })


  after(() => {
    server.close()
  })

})
