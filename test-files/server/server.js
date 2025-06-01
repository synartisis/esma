import * as esma from 'esma'
import { router1 } from './routers/router1.js'
import { router31 } from './routers/router31.js'
import { router32 } from './routers/router32.js'
import { router4 } from './routers/router4.js'
import { r20 } from './routers/20.js'
import { r22 } from './routers/22.js'
import { r24 } from './routers/24.js'
import { r30 } from './routers/30.js'
import { r32 } from './routers/32.js'
import { r40 } from './routers/40.js'
import { r50 } from './routers/50.js'
import { r60 } from './routers/60.js'
import { r90 } from './routers/90.js'

// const port = 30090
const port = 30100
const __dirname = new URL('.', import.meta.url).pathname
export const server = esma.createServer()

server.use(esma.static(__dirname + '/../client/', { extensions: ['html'] }))

server.use(req => {
  req.bag.check = true
})

server.get('/check-middleware', req => {
  return req.bag.check
})

server.use('/20', r20)
server.use('/22', r22)
server.use('/24', r24)
server.use('/30', r30)
server.use('/32', r32)
server.use('/40', r40)
server.use('/50', r50)
server.use('/60', r60)
server.use('/90', r90)



server.use('/route1', router1)
server.use('/route31', router31)
server.use('/route32', router32)
server.use('/route4', router4)
