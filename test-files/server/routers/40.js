import * as esma from 'esma'
const r = esma.router()
export { r as r40 }

const settings = {
  /** @type {'deny'} */
  dotfiles: 'deny',
  extensions: ['html'],
  maxAge: 3600,
}

r.use('/static', esma.static(import.meta.dirname + '/../../client', settings))
