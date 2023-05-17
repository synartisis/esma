import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'
const port = 30040

const server = esma.createServer().listen(port)


describe('request', () => {

  it('should create query object based on request query', async () => {
    server.get('/query', async req => req.query)
    const res = await utils.get(port, '/query?a=1&b=2')
    assert.strictEqual(res.body, JSON.stringify({ a: '1', b: '2'}))
  })
  
  it('should create params object based on url params', async () => {
    server.get('/params/:p1/static/:p2', async req => req.params)
    const res = await utils.get(port, '/params/value1/static/value2')
    assert.strictEqual(res.body, JSON.stringify({ p1: 'value1', p2: 'value2' }))
  })
  
  it('should parse payload', async () => {
    const payload = JSON.stringify({ prop1: 'value1' })
    server.post('/bodyparse', async req => req.body)
    const res = await utils.post(port, '/bodyparse', payload, {
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    })
    assert.ok(!Number.isInteger(res.headers['content-length']), 'header "content-length" is not a number')
    assert.strictEqual(Number.parseInt(res.headers['content-length'] ?? ''), Buffer.byteLength(payload))
    assert.strictEqual(res.body, payload)
  })

  after(() => {
    server.close()
  })

})
