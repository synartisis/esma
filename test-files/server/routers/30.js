import * as esma from 'esma'
import assert from 'node:assert'
const r = esma.router()
export { r as r30 }


r.use('/route2', 
  req => { req.view.data = 1 }, 
  req => {
    if (typeof req.view.data !== 'number') {
      assert.fail('wrong assignment to req.view object');
    }
    return ++req.view.data
  }
)

r.use('/route3', req => 'route3 result')

r.use(req => { req.bag.missingPath = true })
r.use('/check-missing-path', req => req.bag.missingPath)
    
// @ts-expect-error
r.get(req => 'check METHOD without path')
        