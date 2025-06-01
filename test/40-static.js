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

})
