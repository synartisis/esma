import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30060
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

describe('express compat', () => {

  it('should support express.js next()', async () => {
    server.get('/express/next', (req, res, next) => {
      req.bag.data = 1
      // @ts-ignore
      next()
    })
    server.get('/express/next', (req, res, next) => {
      req.bag.data += 1
      return req.bag.data
    })
    const res = await fetch(url + '/express/next')
    assert.strictEqual(await res.text(), '2')
  })

  it('should support express.js res.send', async () => {
    server.get('/express/send', (req, res) => {
      res.send('test')
    })
    const res = await fetch(url + '/express/send')
    assert.strictEqual(await res.text(), 'test')
  })

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
