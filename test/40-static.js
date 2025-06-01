import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as global from './globalSetup.js'

const indexContent = await fs.readFile(import.meta.dirname + '/../test-files/client/index.html', 'utf-8')

describe('static', () => {

  it('should serve static files', async () => {
    const res = await fetch(global.url + '/40/static/index.html')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should serve index when a directory is requested', async () => {
    const res = await fetch(global.url + '/40/static/')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should append extensions', async () => {
    const res = await fetch(global.url + '/40/static/index')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should ignore dotfiles', async () => {
    const res = await fetch(global.url + '/40/static/.ignore.me')
    assert.strictEqual(res.status, 403)
  })

  it('should set Cache-Control header with maxAge option', async () => {
    const res = await fetch(global.url + '/40/static/')
    assert.strictEqual(res.headers.get('cache-control'), 'public, max-age=3600')
  })

  it('should ignore cache-busting signature', async () => {
    const res = await fetch(global.url + '/40/static/assets/styles.ffffff.css')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('content-type'), 'text/css; charset=utf-8')
  })

  it('should support range requests', async () => {
    const url = global.url + '/40/static/assets/large-file.txt'
    let res = await fetch(url, { headers: { 'Range': 'bytes=0-10' } })
    assert.strictEqual(res.status, 206)
    assert.strictEqual(res.headers.get('accept-ranges'), 'bytes')
    assert.strictEqual(res.headers.get('content-length'), '11')
    let body = await res.text()
    assert.strictEqual(body, '1234567890\n')

    res = await fetch(url, { headers: { 'Range': 'bytes=100-' } })
    body = await res.text()
    assert.strictEqual(body, '234567890\n*')

    res = await fetch(url, { headers: { 'Range': 'bytes=50-40' } })
    assert.strictEqual(res.status, 416)  // Range Not Satisfiable
    res = await fetch(url, { headers: { 'Range': 'bytes=50-200' } })
    assert.strictEqual(res.status, 416)  // Range Not Satisfiable
  })

})
