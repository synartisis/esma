import assert from 'node:assert'
import * as utils from './test-utils.js'

const server = utils.getServer()


describe('request', () => {

  it('should create query object based on request query', async () => {
    server.get('/query', async req => req.query)
    const res = await utils.get('/query?a=1&b=2')
    assert.equal(res.body, '{"a":"1","b":"2"}')
  })
  
  it('should create params object based on url params', async () => {
    server.get('/params/:p1/fixed/:p2', async req => req.params)
    const res = await utils.get('/params/value1/fixed/value2')
    assert.equal(res.body, '{"p1":"value1","p2":"value2"}')
  })
  
  it('should parse payload', async () => {
    const payload = JSON.stringify({ prop1: 'value1' })
    server.post('/bodyparse', async req => await req.body)
    const res = await utils.post('/bodyparse', payload, {
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    })
    assert.equal(res.headers['content-length'], Buffer.byteLength(payload))
    assert.equal(res.body, payload)
  })

})