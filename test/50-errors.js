import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30050
const url = `http://localhost:${port}`

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
    const res1 = await fetch(url + '/err/plain-text')
    const res2 = await fetch(url + '/err/error-function')
    const res3 = await fetch(url + '/err/error-constractor')
    assert.equal(res1.status, 500)
    assert.equal((await res1.text()).split('\n')[0], `HTTP 500 - ${errorMessage}`)
    assert.equal(res2.status, 500)
    assert.equal((await res2.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
    assert.equal(res3.status, 500)
    assert.equal((await res3.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  it('should use error handlers', async () => {
    server.onerror((req, res, err) => {
      return err.message
    })
    const res = await fetch(url + '/err/error-constractor')
    assert.equal(res.status, 500)
    assert.equal((await res.text()).split('\n')[0], `HTTP 500 - Error: ${errorMessage}`)
  })

  after(() => {
    server.close()
  })

})
