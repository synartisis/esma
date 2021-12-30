import assert from 'node:assert'
import * as utils from './test-utils.js'

const DATA = {
  html: '<b>this is the body</b>',
  buffer: 'buffer payload',
  object: { type: 'object' },
  array: [1, 2, 3]
}

const server = utils.getServer()
server.get('/response/:type', async req => {
  const { type } = req.params
  let body
  if (type === 'html') body = DATA.html
  if (type === 'buffer') body = Buffer.from(DATA.buffer)
  if (type === 'object') body = DATA.object
  if (type === 'array') body = DATA.array
  return body
})
server.get('/builtin', async req => {
  return {
    $statusCode: 202,
    $headers: { 'X-Type': 'test' },
    $body: 'body content',
    $error: Error('*error message*')
  }
})
server.get('/builtin-error', async req => {
  throw Error('*error message*')
})

describe('response object - response types', () => {

  it('html', async () => {
    let res = await utils.get('/response/html')
    assert.equal(res.headers['content-type'], 'text/html; charset=utf-8')
    assert.equal(res.headers['content-length'], Buffer.from(DATA.html).byteLength)
    assert.equal(res.body, DATA.html)
  })

  it('buffer', async () => {
    let res = await utils.get('/response/buffer')
    assert.equal(res.headers['content-type'], 'application/octet-stream')
    assert.equal(res.headers['content-length'], Buffer.from(DATA.buffer).byteLength)
    assert.equal(res.body, DATA.buffer)
  })

  it('object', async () => {
    let res = await utils.get('/response/object')
    assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
    assert.equal(res.headers['content-length'], Buffer.from(JSON.stringify(DATA.object)).byteLength)
    assert.equal(res.body, JSON.stringify(DATA.object))
  })

  it('array', async () => {
    let res = await utils.get('/response/array')
    assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
    assert.equal(res.headers['content-length'], Buffer.from(JSON.stringify(DATA.array)).byteLength)
    assert.equal(res.body, JSON.stringify(DATA.array))
  })

})

describe('response object - built-in properties', () => {

  it('$statusCode', async () => {
    let res = await utils.get('/builtin')
    assert.equal(res.statusCode, '202')
  })

  it('$headers', async () => {
    let res = await utils.get('/builtin')
    assert.equal(res.headers['x-type'], 'test')
  })

  it('$body', async () => {
    let res = await utils.get('/builtin')
    assert.equal(res.body, 'body content')
  })

})

describe('response object - errors', () => {

  it('handle error', async () => {
    let res = await utils.get('/builtin-error')
    assert.equal(res.statusCode, '500')
    assert.equal(res.body.split('\n')[0], 'Error: *error message*')
  })

})

