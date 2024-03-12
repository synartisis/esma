import { randomUUID } from 'crypto'
import { settings } from '../esma-settings.js'

/** @typedef {import('esma').Request} Request */
/** @typedef {import('esma').Response} Response */
/** @typedef {import('esma').Session} Session */


/** @type {Session[]} */
export const sessions = []


/** @type {(req: Request, res: Response, username: string, roles: string[], bag?: Record<string, string>) => Session} */
export function createSession(req, res, username, roles, bag = {}) {
  const existingUserSession = sessions.find(o => o.username === username)
  let session = null
  if (existingUserSession) {
    session = existingUserSession
    Object.assign(session, { roles, bag })
  } else {
    session = { sessionId: randomUUID(), username, roles, bag }
    sessions.push(session)
  }
  req.session = session
  res.setHeader('set-cookie', `${settings.sessionCookieName}=${session.sessionId}; path=/`)
  return session
}


/** @param {Request} req */
export function attachSession(req) {
  const sessionId = getSessionCookie(req)
  if (!sessionId) return
  const session = sessions.find(o => o.sessionId === sessionId)
  if (!session) return
  req.session = session
}


/** @type {(req: Request, res: Response) => void} */
export function removeSession(req, res) {
  if (!req.session) return
  const sessionIndex = sessions.indexOf(req.session)
  if (sessionIndex > -1) sessions.splice(sessionIndex, 1)
  res.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; path=/`)
}




/** @type {(req: Request) => string | undefined} */
function getSessionCookie(req) {
  if (!req.headers['cookie']) return 
  const cookies = req.headers['cookie'].split(';').map(o => o.trim().split('='))
  for (const [cookieName, cookieValue] of cookies) {
    if (cookieName === settings.sessionCookieName) {
      return cookieValue
    }
  }
}
