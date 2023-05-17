import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'

const port = 30070

const server = esma.createServer().listen(port)


describe('express compat', () => {

  it('should support express.js next()', async () => {
    server.get('/express/next', (req, res, next) => {
      req.data = 1
      // @ts-ignore
      next()
    })
    server.get('/express/next', (req, res, next) => {
      req.data += 1
      return req.data
    })
    const res = await utils.get(port, '/express/next')
    assert.strictEqual(res.body, '2')
  })

  it(`should support express.js next('route')`, async () => {
    server.get('/express/next-route', (req, res, next) => {
      req.nextRoutes = ['A']
      // @ts-ignore
      next('route')
    }, (req, res, next) => {
      req.nextRoutes.push('B')
      // @ts-ignore
      next()
    })
    server.get('/express/next-route', (req, res, next) => {
      req.nextRoutes.push('C')
      return req.nextRoutes
    })
    const res = await utils.get(port, '/express/next-route')
    assert.strictEqual(res.body, JSON.stringify(['A', 'C']))
  })

  it('should support express.js res.send', async () => {
    server.get('/express/send', (req, res) => {
      res.send('test')
    })
    const res = await utils.get(port, '/express/send')
    assert.strictEqual(res.body, 'test')
  })

  it('should support express.js res.redirect', async () => {
    server.get('/express/redirect', (req, res) => {
      res.redirect('/express/new-location')
    })
    const res = await utils.get(port, '/express/redirect')
    assert.strictEqual(res.statusCode, 302)
    assert.strictEqual(res.headers['location'], '/express/new-location')
  })

  after(() => {
    server.close()
  })

})
