import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as esma from 'esma'
const port = 30040
const url = `http://localhost:${port}`

const server = esma.createServer().listen(port)

const __dirname = new URL('.', import.meta.url).pathname
const settings = {
  /** @type {'deny'} */
  dotfiles: 'deny',
  extensions: ['html'],
  maxAge: 3600,
}
server.use('/static', esma.static(__dirname + 'static', settings))
const indexContent = await fs.readFile(__dirname + '/static/index.html', 'utf-8')

describe('static', () => {

  it('should serve static files', async () => {
    const res = await fetch(url + '/static/index.html')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should serve index when a directory is requested', async () => {
    const res = await fetch(url + '/static/')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should append extensions', async () => {
    const res = await fetch(url + '/static/index')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(await res.text(), indexContent)
  })

  it('should ignore dotfiles', async () => {
    const res = await fetch(url + '/static/.ignore.me')
    assert.strictEqual(res.status, 403)
  })

  it('should set Cache-Control header with maxAge option', async () => {
    const res = await fetch(url + '/static/')
    assert.strictEqual(res.headers.get('cache-control'), 'public, max-age=3600')
  })

  it('should ignore cache-busting signature', async () => {
    const res = await fetch(url + '/static/styles.ffffff.css')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('content-type'), 'text/css; charset=utf-8')
  })

  after(() => {
    server.close()
  })

})
