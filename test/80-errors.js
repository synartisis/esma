import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'

const port = 30080

const server = esma.createServer().listen(port)
const errorMessage = '*error message*'

describe('error handling', () => {

  it('should respond to throw Error with http 500', async () => {
    server.use('/err/:type', req => {
      const { type } = req.params
      if (type === 'plain-text') throw errorMessage
      if (type === 'error-function') throw Error(errorMessage)
      if (type === 'error-constractor') throw new Error(errorMessage)
    })
    const res1 = await utils.get(port, '/err/plain-text')
    const res2 = await utils.get(port, '/err/error-function')
    const res3 = await utils.get(port, '/err/error-constractor')
    assert.equal(res1.statusCode, 500)
    assert.equal(res1.body.split('\n')[0], `HTTP 500 - ${errorMessage}`)
    assert.equal(res2.statusCode, 500)
    assert.equal(res2.body.split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
    assert.equal(res3.statusCode, 500)
    assert.equal(res3.body.split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  it('should use error handlers', async () => {
    server.onerror((err, req, res) => {
      return err.message
    })
    const res = await utils.get(port, '/err/error-constractor')
    assert.equal(res.statusCode, 500)
    assert.equal(res.body.split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  it('should accept express-like error middleware', async () => {
    //@ts-ignore
    server.use('/error-express', (err, req, res, next) => {
      return err.message
    })
    server.get('/error-express/test', req => {
      throw Error('express-error')
    })
    const res = await utils.get(port, '/error-express/test')
    assert.equal(res.statusCode, 500)
    assert.equal(res.body.split('\n')[0], `HTTP 500 - Error: express-error`)
  })

  after(() => {
    server.close()
  })

})
