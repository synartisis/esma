import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as global from './globalSetup.js'


describe('request', () => {

  it('should create query object based on request query', async () => {
    const body = await fetch(global.url + '/22/query?a=1&b=2').then(o => o.json())
    assert.deepStrictEqual(body, { a: '1', b: '2' })
  })
  
  it('should create params object based on url params', async () => {
    const body = await fetch(global.url + '/22/params/value1/static/value2').then(o => o.json())
    assert.deepStrictEqual(body, { p1: 'value1', p2: 'value2' })
  })
  
  it('should parse payload: json', async () => {
    const payload = JSON.stringify({ prop1: 'value1' })
    const resp = await fetch(global.url + '/22/bodyparse-json', {
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
    const resp = await fetch(global.url + '/22/bodyparse-urlencoded', {
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
    const resp = await fetch(global.url + '/22/bodyparse-formdata', {
      method: 'post',
      body: formData
    })
    assert.ok(resp.ok)
    const body = await resp.text()
    // TODO: NOT IMPLEMENTED
    // console.log(body)
  })

})
