/** @import * as esma from 'esma' */
import { HttpError } from '../utils.js'


/** @type {(allowedRoles?: string[]) => esma.Handler} */
export function authorize(allowedRoles = []) {
  return (req, res) => {
    if (req.session.status !== 'loggedon') throw new HttpError(401, 'not authorized')
    if (allowedRoles.length === 0) return
    if (!Array.isArray(allowedRoles)) throw new HttpError(500, `allowedRoles must be an array`)
    const authorized = req.session.roles.some(role => allowedRoles.map(o => o.toLowerCase()).includes(role.toLowerCase()))    
    if (!authorized) throw new HttpError(401, 'not authorized')
  }
}
