import esma from '../lib/esma.js'
import * as http from 'node:http'


export function createServer() {
  const server = esma.createServer()
  server.listen(3333)
  return server
}

export async function get(url) {
  return new Promise((resolve, reject) => {
    http.request(`http://localhost:3333${url}`, res => {
      const result = []
      res
      .on('data', chunk => result.push(chunk))
      .on('end', () => resolve(result))
      .on('error', err => reject(err))
    }).end()
  })
}

export async function getJson(url) {
  const res = await get(url)
  return JSON.parse(res)
}