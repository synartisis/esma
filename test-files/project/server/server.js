import * as esma from 'esma'
import { router1 } from './routers/router1.js'

const port = 30090
const __dirname = new URL('.', import.meta.url).pathname
export const server = esma.createServer()

server.use(esma.static(__dirname + '/../client/', { extensions: ['html'] }))

server.use(req => {
  req.bag.check = true
})

server.get('/middleware', req => {
  return req.bag.check
})

server.use('/route1', router1)
