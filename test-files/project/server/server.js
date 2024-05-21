import * as esma from 'esma'
import { router1 } from './routers/router1.js'
import { router31 } from './routers/router31.js'
import { router32 } from './routers/router32.js'
import { router4 } from './routers/router4.js'

const port = 30090
const __dirname = new URL('.', import.meta.url).pathname
export const server = esma.createServer()

server.use(esma.static(__dirname + '/../client/', { extensions: ['html'] }))

server.use(req => {
  req.bag.check = true
})

server.get('/check-middleware', req => {
  return req.bag.check
})

server.use('/route1', router1)
server.use('/route31', router31)
server.use('/route32', router32)
server.use('/route4', router4)

server.listen(port)
