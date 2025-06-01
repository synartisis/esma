import * as esma from 'esma'
const r = esma.router()
export { r as r24 }

const DATA = {
  html: '<b>this is the body</b>',
  buffer: 'buffer payload',
  object: { type: 'object' },
  array: [1, 2, 3],
  errorMessage: '*error message*',
}

r.get('/response/:type', async req => {
  const { type } = req.params
  let body
  if (type === 'html') body = DATA.html
  if (type === 'buffer') body = Buffer.from(DATA.buffer)
  if (type === 'object') body = DATA.object
  if (type === 'array') body = DATA.array
  if (type === 'null') body = null
  if (type === 'undefined') body = undefined
  return body
})

r.get('/builtin', async req => {
  return {
    $statusCode: 202,
    $headers: { 'X-Type': 'test' },
    $body: 'body content',
  }
})

r.get('/builtin-error', async req => {
  throw Error(DATA.errorMessage)
})
