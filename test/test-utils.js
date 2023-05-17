import * as esma from '../lib/esma.js'
import * as http from 'node:http'
import { HttpError } from '../lib/server/utils.js'
export { config, settings } from '../lib/esma-settings.js'


/** @param {number} port  */
export function createServer(port) {
  const server = esma.createServer()
  server.listen(port)
  return server
}


/** @type {(port: number, url: string) => Promise<{statusCode?: number, headers: http.IncomingHttpHeaders, body: string}>} */
export async function get(port, url) {
  return new Promise((resolve, reject) => {
    http.request(`http://localhost:${port}${url}`, res => {
      /** @type {any[]} */
      const result = []
      res
      .on('data', chunk => result.push(chunk))
      .on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: result.join() }))
      .on('error', err => reject(err))
    }).end()
  })
}


/** @type {(port: number, url: string, body: unknown, options: any) => Promise<{statusCode?: number, headers: http.IncomingHttpHeaders, body: string}>} */
export async function post(port, url, body, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: url,
      method: 'POST',
      ...options
    }, res => {
      /** @type {any[]} */
      const result = []
      res
      .on('data', chunk => result.push(chunk))
      .on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: result.join() }))
      .on('error', err => reject(err))
    })
    req.write(body)
    req.end()
  })
}


/** @type {(statusCode: number) => string} */
export function httpError(statusCode) {
  // @ts-expect-error
  return new HttpError(statusCode).message
}