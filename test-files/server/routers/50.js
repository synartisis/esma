import * as esma from 'esma'
const r = esma.router()
export { r as r50 }

const errorMessage = '*error message*'

r.use('/err/:type', req => {
  const { type } = req.params
  if (type === 'plain-text') throw errorMessage
  if (type === 'error-function') throw Error(errorMessage)
  if (type === 'error-constructor') throw new Error(errorMessage)
  if (type === 'esma-error-500') throw new esma.HttpError(500, errorMessage)
  if (type === 'esma-error-400') throw new esma.HttpError(400, errorMessage)
})

r.onerror(err => {
  return err.message
})
