import esma, { router } from '../lib/esma.js'
import * as http from 'node:http'
export { config, settings } from '../lib/esma-settings.js'


export function createServer() {
  const server = esma.createServer()
  server.listen()
}

let server
export function getServer() {
  if (!server) {
    server = esma.createServer()
    server.listen(3333)
  }
  return server
}

export function getSubrouter() {
  return router()
}

export async function get(url) {
  return new Promise((resolve, reject) => {
    http.request(`http://localhost:3333${url}`, res => {
      const result = []
      res
      .on('data', chunk => result.push(chunk))
      .on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: result.join() }))
      .on('error', err => reject(err))
    }).end()
  })
}


export async function post(url, body, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3333,
      path: url,
      method: 'POST',
      ...options
    }, res => {
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


// export async function getJson(url) {
//   const res = await get(url)
//   return JSON.parse(res)
// }