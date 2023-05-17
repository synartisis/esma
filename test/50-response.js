import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import * as esma from '../lib/esma.js'
const port = 30050

const DATA = {
  html: '<b>this is the body</b>',
  buffer: 'buffer payload',
  object: { type: 'object' },
  array: [1, 2, 3]
}

const server = esma.createServer().listen(port)
server.get('/response/:type', async req => {
  const { type } = req.params
  let body
  if (type === 'html') body = DATA.html
  if (type === 'buffer') body = Buffer.from(DATA.buffer)
  if (type === 'object') body = DATA.object
  if (type === 'array') body = DATA.array
  if (type === 'null') body = null
  if (type === 'undefined') body = undefined
  return body
})
server.get('/builtin', async req => {
  return {
    $statusCode: 202,
    $headers: { 'X-Type': 'test' },
    $body: 'body content',
  }
})
server.get('/builtin-error', async req => {
  throw Error('*error message*')
})

describe('response object - response types', () => {

  it('html', async () => {
    let res = await utils.get(port, '/response/html')
    assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    assert.strictEqual(Number(res.headers['content-length']), Buffer.from(DATA.html).byteLength)
    assert.strictEqual(res.body, DATA.html)
  })

  it('buffer', async () => {
    let res = await utils.get(port, '/response/buffer')
    assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
    assert.strictEqual(Number(res.headers['content-length']), Buffer.from(DATA.buffer).byteLength)
    assert.strictEqual(res.body, DATA.buffer)
  })

  it('object', async () => {
    let res = await utils.get(port, '/response/object')
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    assert.strictEqual(Number(res.headers['content-length']), Buffer.from(JSON.stringify(DATA.object)).byteLength)
    assert.strictEqual(res.body, JSON.stringify(DATA.object))
  })

  it('array', async () => {
    let res = await utils.get(port, '/response/array')
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    assert.strictEqual(Number(res.headers['content-length']), Buffer.from(JSON.stringify(DATA.array)).byteLength)
    assert.strictEqual(res.body, JSON.stringify(DATA.array))
  })

  it('null', async () => {
    let res = await utils.get(port, '/response/null')
    assert.strictEqual(Number(res.headers['content-length']), 0)
    assert.strictEqual(res.body, '')
  })

  it('undefined', async () => {
    const expected = 'HTTP 404 - Cannot GET /response/undefined'
    let res = await utils.get(port, '/response/undefined')
    assert.strictEqual(res.body, expected)
    assert.strictEqual(Number(res.headers['content-length']), expected.length)
    assert.strictEqual(res.statusCode, 404)
  })

})

describe('response object - built-in properties', () => {

  it('$statusCode', async () => {
    let res = await utils.get(port, '/builtin')
    assert.strictEqual(res.statusCode, 202)
  })

  it('$headers', async () => {
    let res = await utils.get(port, '/builtin')
    assert.strictEqual(res.headers['x-type'], 'test')
  })

  it('$body', async () => {
    let res = await utils.get(port, '/builtin')
    assert.strictEqual(res.body, 'body content')
  })

})

describe('response object - errors', () => {

  it('handle error', async () => {
    let res = await utils.get(port, '/builtin-error')
    assert.strictEqual(res.statusCode, 500)
    assert.strictEqual(res.body.split('\n')[0], 'HTTP 500 - Error: *error message*')
  })

  after(() => {
    server.close()
  })

})

