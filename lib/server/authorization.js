import { HttpError } from './utils.js'


/** @type {(allowedRoles?: string[]) => esma.Handler} */
export function authorize(allowedRoles) {
  return (req, res) => {
    if (!req.session.isLoggedOn) throw new HttpError(401, 'not authorized', req, res)
    if (!allowedRoles || allowedRoles.length === 0) return
    if (!Array.isArray(allowedRoles)) throw new HttpError(500, `allowedRoles must be an array`, req, res)
    const userRoles = req.session.roles
    let authorized = false
    allowedRoles.forEach(ar => {
      if (userRoles.includes(ar)) authorized = true
    })
    if (!authorized) throw new HttpError(401, 'not authorized', req, res)
  }
}
