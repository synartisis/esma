import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as esma from '../lib/esma.js'
const port = 30022
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

describe('request', () => {

  it('should create query object based on request query', async () => {
    server.get('/query', async req => req.query)
    const body = await fetch(url + '/query?a=1&b=2').then(o => o.json())
    assert.deepStrictEqual(body, { a: '1', b: '2' })
  })
  
  it('should create params object based on url params', async () => {
    server.get('/params/:p1/static/:p2', async req => req.params)
    const body = await fetch(url + '/params/value1/static/value2').then(o => o.json())
    assert.deepStrictEqual(body, { p1: 'value1', p2: 'value2' })
  })
  
  it('should parse payload: json', async () => {
    const payload = JSON.stringify({ prop1: 'value1' })
    server.post('/bodyparse-json', async req => req.body)
    const resp = await fetch(url + '/bodyparse-json', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(payload))
      },
      body: payload
    })
    if (!resp.headers.has('content-length')) assert.fail('missing header: "content-length"')
    assert.strictEqual(Number.parseInt(resp.headers.get('content-length') ?? ''), Buffer.byteLength(payload))
    assert.strictEqual(await resp.text(), payload)
  })

  it('should parse payload: urlencoded', async () => {
    const params = new URLSearchParams
    params.append('p1', 'v1')
    params.append('p2', 'v2')
    server.post('/bodyparse-urlencoded', async req => req.body)
    const resp = await fetch(url + '/bodyparse-urlencoded', {
      method: 'post',
      body: params
    })
    assert.ok(resp.ok)
    assert.strictEqual(await resp.text(), JSON.stringify(Object.fromEntries(params)))
  })

  it('should parse payload: formdata', async () => {
    const formData = new FormData
    formData.set('p1', 'v1')
    formData.set('p2', 'v2')
    server.post('/bodyparse-formdata', async req => req.body)
    const resp = await fetch(url + '/bodyparse-formdata', {
      method: 'post',
      body: formData
    })
    assert.ok(resp.ok)
    const body = await resp.text()
    // TODO: NOT IMPLEMENTED
    // console.log(body)
  })

  after(() => {
    server.close()
  })

})
