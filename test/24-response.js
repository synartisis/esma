import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'

const DATA = {
  html: '<b>this is the body</b>',
  buffer: 'buffer payload',
  object: { type: 'object' },
  array: [1, 2, 3],
  errorMessage: '*error message*',
}


describe('response object - response types', () => {

  it('html', async () => {
    const res = await fetch(global.url + '/24/response/html')
    assert.strictEqual(res.headers.get('content-type'), 'text/html; charset=utf-8')
    assert.strictEqual(Number(res.headers.get('content-length')), Buffer.from(DATA.html).byteLength)
    assert.strictEqual(await res.text(), DATA.html)
  })

  it('buffer', async () => {
    const res = await fetch(global.url + '/24/response/buffer')
    assert.strictEqual(res.headers.get('content-type'), 'application/octet-stream')
    assert.strictEqual(Number(res.headers.get('content-length')), Buffer.from(DATA.buffer).byteLength)
    assert.strictEqual(await res.text(), DATA.buffer)
  })

  it('object', async () => {
    const res = await fetch(global.url + '/24/response/object')
    assert.strictEqual(res.headers.get('content-type'), 'application/json; charset=utf-8')
    assert.strictEqual(Number(res.headers.get('content-length')), Buffer.from(JSON.stringify(DATA.object)).byteLength)
    assert.deepStrictEqual(await res.json(), DATA.object)
  })

  it('array', async () => {
    const res = await fetch(global.url + '/24/response/array')
    assert.strictEqual(res.headers.get('content-type'), 'application/json; charset=utf-8')
    assert.strictEqual(Number(res.headers.get('content-length')), Buffer.from(JSON.stringify(DATA.array)).byteLength)
    assert.deepStrictEqual(await res.json(), DATA.array)
  })

  it('null', async () => {
    const res = await fetch(global.url + '/24/response/null')
    assert.strictEqual(Number(res.headers.get('content-length')), 0)
    assert.strictEqual(await res.text(), '')
  })

})

describe('response object - built-in properties', () => {

  it('$statusCode', async () => {
    const res = await fetch(global.url + '/24/builtin')
    assert.strictEqual(res.status, 202)
  })

  it('$headers', async () => {
    const res = await fetch(global.url + '/24/builtin')
    assert.strictEqual(res.headers.get('x-type'), 'test')
  })

  it('$body', async () => {
    const res = await fetch(global.url + '/24/builtin')
    assert.strictEqual(await res.text(), 'body content')
  })

})

describe('response object - errors', () => {

  it('handle error', async () => {
    const res = await fetch(global.url + '/24/builtin-error')
    assert.strictEqual(res.status, 500)
    const body = await res.text()
    assert.strictEqual(body.split('\n')[0], `HTTP 500 - Error: ${DATA.errorMessage}`)
  })

})

