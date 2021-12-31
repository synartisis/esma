import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()
const errorMessage = '*error message*'

describe('error handling', () => {

  it('should respond to throw Error with http 500', async () => {
    server.use('/err/:type', req => {
      const { type } = req.params
      if (type === '1') throw Error(errorMessage)
      if (type === '2') throw errorMessage
    })
    const res1 = await utils.get('/err/1')
    const res2 = await utils.get('/err/2')
    assert.equal(res1.statusCode, 500)
    assert.equal(res1.body.split('\n')[0], `Error: ${errorMessage}`)
    assert.equal(res2.statusCode, 500)
    assert.equal(res2.body, `${errorMessage}`)
  })

  it('should use error handlers', async () => {
    server.onerror((err, req, res) => {
      return err.message
    })
    const res = await utils.get('/err/1')
    assert.equal(res.statusCode, 500)
    assert.equal(res.body, JSON.stringify(errorMessage))
  })

  it('should accept express-like error middleware', async () => {
    server.use('/error-express', (err, req, res, next) => {
      return err.message
    })
    server.get('/error-express/test', req => {
      throw Error('express-error')
    })
    const res = await utils.get('/error-express/test')
    assert.equal(res.statusCode, 500)
    assert.equal(res.body, JSON.stringify('express-error'))
  })

})