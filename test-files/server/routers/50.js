import * as esma from 'esma'
const r = esma.router()
export { r as r50 }

const errorMessage = '*error message*'

r.use('/err/:type', req => {
  const { type } = req.params
  if (type === 'plain-text') throw errorMessage
  if (type === 'error-function') throw Error(errorMessage)
  if (type === 'error-constractor') throw new Error(errorMessage)
})

r.onerror((req, res, err) => {
  return err.message
})
