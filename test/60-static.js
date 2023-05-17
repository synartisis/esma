import { describe, it, after } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './test-utils.js'
import { promises as fs } from 'node:fs'
import * as esma from '../lib/esma.js'
const port = 30060

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
    const res = await utils.get(port, '/static/index.html')
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body, indexContent)
  })

  it('should serve index when a directory is requested', async () => {
    const res = await utils.get(port, '/static/')
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body, indexContent)
  })

  it('should append extensions', async () => {
    const res = await utils.get(port, '/static/index')
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body, indexContent)
  })

  it('should ignore dotfiles', async () => {
    const res = await utils.get(port, '/static/.ignore.me')
    assert.strictEqual(res.statusCode, 403)
  })

  it('should set Cache-Control header with maxAge option', async () => {
    const res = await utils.get(port, '/static/')
    assert.strictEqual(res.headers['cache-control'], 'public, max-age=3600')
  })

  it('should ignore cache-busting signature', async () => {
    const res = await utils.get(port, '/static/styles.ffffff.css')
    assert.strictEqual(res.statusCode, 200)
  })

  after(() => {
    server.close()
  })

})
