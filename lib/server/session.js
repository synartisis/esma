import * as http from 'node:http'
import { randomUUID } from 'crypto'
import { settings } from '../esma-settings.js'


/** @type {esma.SessionData<unknown>[]} */
export const sessions = []


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.Session<unknown>} */
export function attachSession(httpRequest, httpResponse) {
  const sessionId = getSessionIdFromCookie(httpRequest)
  const sessionData = sessionId ? sessions.find(o => o.sessionId === sessionId) : undefined
  if (!!sessionData && typeof sessionId === 'string') {
    return createSessionObjectLoggedOn(httpResponse, sessionId, sessionData)
  } else {
    return createSessionObjectNotLoggedOn(httpResponse)
  }
}


/** @type {(httpResponse: http.ServerResponse) => esma.Session<unknown>} */
function createSessionObjectNotLoggedOn(httpResponse) {
  return {
    isLoggedOn: false,
    /** @type {(username: string, roles: string[], bag?: unknown) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) return
      const sessionData = { sessionId: randomUUID(), username, roles, bag }
      sessions.push(sessionData)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${sessionData.sessionId}; path=/`)
    },
  }
}

/** @type {(httpResponse: http.ServerResponse, sessionId: string, sessionData: esma.SessionData<unknown>) => esma.Session<unknown>} */
function createSessionObjectLoggedOn(httpResponse, sessionId, sessionData) {
  return {
    isLoggedOn: true,
    logout() {
      const sessionIndex = sessions.findIndex(o => o.sessionId === sessionId)
      if (sessionIndex > -1) sessions.splice(sessionIndex, 1)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; path=/`)
    },
    ...sessionData,
  }
}




// /** @type {(req: Request, res: Response, username: string, roles: string[], bag?: Record<string, string>) => SessionData} */
// function createSession1(req, res, username, roles, bag = {}) {
//   const existingUserSessionData = sessions.find(o => o.username === username)
//   let sessionData = null
//   if (existingUserSessionData) {
//     sessionData = existingUserSessionData
//     Object.assign(sessionData, { roles, bag })
//   } else {
//     sessionData = { sessionId: randomUUID(), username, roles, bag }
//     sessions.push(sessionData)
//   }
//   req.session = {
//     isLoggedOn: true,
//     logout() { this.isLoggedOn = false; removeSession(req, res) },
//     ...sessionData,
//   }
//   res.setHeader('set-cookie', `${settings.sessionCookieName}=${sessionData.sessionId}; path=/`)
//   return sessionData
// }


// // /** @param {Request} req */
// /** @type {(req: Request, res: Response) => void} */
// function attachSession1(req, res) {
//   const sessionId = getSessionCookie(req)
//   if (!sessionId) return
//   const sessionData = sessions.find(o => o.sessionId === sessionId)
//   if (!sessionData) return
//   req.session = {
//     isLoggedOn: true,
//     logout() { removeSession(req, res) },
//     ...sessionData,
//   }
// }


// /** @type {(req: Request, res: Response) => void} */
// export function removeSession(req, res) {
//   if (!req.session.isLoggedOn) return
//   const sessionIndex = sessions.indexOf(req.session)
//   if (sessionIndex > -1) sessions.splice(sessionIndex, 1)
//   res.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; path=/`)
// }


// /** @type {(req: Request, res: Response, isLoggedOn: boolean, sessionData: SessionData) => Session} */
// export function createSessionObject(req, res, isLoggedOn, sessionData) {
//   if (isLoggedOn) {
//     return {
//       isLoggedOn: true,
//       logout() { removeSession(req, res) },
//       ...sessionData,
//     }
//   } else {
//     return {
//       isLoggedOn: false,
//       login(username, roles),
//     }
//   }
// }



/** @type {(req: http.IncomingMessage) => string | undefined} */
function getSessionIdFromCookie(httpRequest) {
  if (!httpRequest.headers['cookie']) return 
  const cookies = httpRequest.headers['cookie'].split(';').map(o => o.trim().split('='))
  for (const [cookieName, cookieValue] of cookies) {
    if (cookieName === settings.sessionCookieName) {
      return cookieValue
    }
  }
}
