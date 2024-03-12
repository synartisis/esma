import { attachSession, createSession, removeSession } from './session.js'
import { HttpError } from './utils.js'

/** @typedef {(import('esma').Middleware)} Middleware */


/** @type {(allowedRoles?: string[]) => Middleware} */
export function authorize(allowedRoles) {
  return (req, res) => {
    if (!req.session) attachSession(req)
    if (!req.session) throw new HttpError(401, 'not authorized', req, res)
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


/** @type {(username: string, roles: string[], bag?: Record<string, string>) => Middleware} */
export function login(username, roles, bag = {}) {
  return (req, res) => {
    createSession(req, res, username, roles, bag)
  }
}


/** @type {() => Middleware} */
export function logout() {
  return (req, res) => {
    attachSession(req)
    removeSession(req, res)
  }
}