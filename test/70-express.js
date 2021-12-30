import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()


describe('express compat', () => {

  it('should support express.js next()', async () => {
    server.use('/express/next', (req, res, next) => {
      req.data = 1
      next()
    })
    server.use('/express/next', (req, res, next) => {
      req.data += 1
      return req.data
    })
    const res = await utils.get('/express/next')
    assert.equal(res.body, '2')
  })

  it('should support express.js res.send', async () => {
    server.use('/express/send', (req, res) => {
      res.send('test')
    })
    const res = await utils.get('/express/send')
    assert.equal(res.body, 'test')
  })

  it('should support express.js res.redirect', async () => {
    server.use('/express/redirect', (req, res) => {
      res.redirect('/express/new-location')
    })
    const res = await utils.get('/express/redirect')
    assert.equal(res.statusCode, '302')
    assert.equal(res.headers['location'], '/express/new-location')
  })

})
