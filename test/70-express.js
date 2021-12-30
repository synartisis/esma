import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()


describe('express compat', () => {

  it('should support express.js next()', async () => {
    server.get('/express/next', (req, res, next) => {
      req.data = 1
      next()
    })
    server.get('/express/next', (req, res, next) => {
      req.data += 1
      return req.data
    })
    const res = await utils.get('/express/next')
    assert.equal(res.body, '2')
  })

  it(`should support express.js next('route')`, async () => {
    server.get('/express/next-route', (req, res, next) => {
      req.nextRoutes = ['A']
      next('route')
    }, (req, res, next) => {
      req.nextRoutes.push('B')
      next()
    })
    server.get('/express/next-route', (req, res, next) => {
      req.nextRoutes.push('C')
      return req.nextRoutes
    })
    const res = await utils.get('/express/next-route')
    assert.equal(res.body, JSON.stringify(['A', 'C']))
  })

  it('should support express.js res.send', async () => {
    server.get('/express/send', (req, res) => {
      res.send('test')
    })
    const res = await utils.get('/express/send')
    assert.equal(res.body, 'test')
  })

  it('should support express.js res.redirect', async () => {
    server.get('/express/redirect', (req, res) => {
      res.redirect('/express/new-location')
    })
    const res = await utils.get('/express/redirect')
    assert.equal(res.statusCode, '302')
    assert.equal(res.headers['location'], '/express/new-location')
  })

})
