import { describe, it } from 'node:test'
import * as esma from 'esma'

// this test is only for type checking

describe('types', () => {

  it('should conform with types', async () => {
    const server = esma.createServer()
    const router = esma.router()
    server.use('/mnt', router)
    router.get('/return-types/:type', req => {
      const { type } = req.params
      switch (type) {
        case 'string': return 'a string'
        case 'string-array': return ['str1', 'str2']
        case 'number': return 42
        case 'number-array': return [1, 2, 3]
        case 'date': return new Date
        case 'buffer': return Buffer.from('')
        case 'object': return { p1: 1, p2: [{ p21: true }] }
        case 'object-array': return [{ p1: 1 }, { p1: 2 }]
        case 'null': return null
        case 'wrapped': return { $statusCode: 200, $headers: 1 }
      }
    })

  })

})
