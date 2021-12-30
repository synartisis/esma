import assert from 'node:assert'
import * as utils from './test-utils.js'
import esma from '../lib/esma.js'

const server = utils.getServer()
const __dirname = new URL('.', import.meta.url).pathname
const settings = {
  dotfiles: 'deny',
  extensions: ['html'],
  maxAge: 3600,
}
server.use('/static', esma.static(__dirname + 'static', settings))

describe('static', () => {

  it('should serve static files', async () => {
    const res = await utils.get('/static/index.html')
    assert.equal(res.statusCode, '200')
    assert.equal(res.headers['etag'], '"116-17e0a79773b"')
  })

  it('should serve index when a directory is requested', async () => {
    const res = await utils.get('/static/')
    assert.equal(res.statusCode, '200')
    assert.equal(res.headers['etag'], '"116-17e0a79773b"')
  })

  it('should append extensions', async () => {
    const res = await utils.get('/static/index')
    assert.equal(res.statusCode, '200')
    assert.equal(res.headers['etag'], '"116-17e0a79773b"')
  })

  it('should ignore dotfiles', async () => {
    const res = await utils.get('/static/.ignore.me')
    assert.equal(res.statusCode, '403')
  })

  it('should set Cache-Control header with maxAge option', async () => {
    const res = await utils.get('/static/')
    assert.equal(res.headers['cache-control'], 'public, max-age=3600')
  })

  it('should ignore cache-busting signature', async () => {
    const res = await utils.get('/static/styles.ffffff.css')
    assert.equal(res.statusCode, '200')
  })

})
