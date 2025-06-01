import * as esma from 'esma'
const r = esma.router()
export { r as r32 }


const router1 = esma.router()
const router2 = esma.router()
const router3 = esma.router()
const router4 = esma.router()
r.use('/route1', router1)
router1.use('/route2', router2)

router1.get('/test', req => 'ok')

router1.get('/paths1', req => {
  const { url, originalUrl } = req
  return { url, originalUrl }
})

router2.get('/paths2', req => {
  const { url, originalUrl } = req
  return { url, originalUrl }
})

router3.get('/test3', req => 'path3')
r.use('/route3', router3)
router2.use('/route4', router4)
router4.get('/test4', req => 'path4')
