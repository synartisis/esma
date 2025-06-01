import * as esma from 'esma'
const r = esma.router()
export { r as r60 }


r.get('/express/redirect', (req, res) => {
  res.redirect('/express/new-location')
})
