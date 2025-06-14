/** @import * as http from 'node:http' */
/** @import * as esma from 'esma' */
import { randomUUID } from 'crypto'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import { settings } from '../esma-settings.js'

const SESSION_TTL = 1000 * 60 * 60   // one hour
const IS_PERSISTENT = true
let persistenceFilename = ''
let saveSessionsLastCall = 0

/** @type {Map<string, types.Session>} */
export const sessions = new Map

if (IS_PERSISTENT) await activatePersistence()

/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.SessionHandler} */
export function createSessionHandler(httpRequest, httpResponse) {
  // check if session cookie already exists and get session data
  const sessionId = getSessionIdFromSessionCookie(httpRequest)
  if (!sessionId) return createSessionHandlerDetached(httpRequest, httpResponse)
  const session = sessions.get(sessionId)
  if (!session) {
    // cookie has a sessionId that is not mapped to sessions map, so remove it and return a detached session handler
    httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
    return createSessionHandlerDetached(httpRequest, httpResponse)
  }
  if (session.status === 'attached') {
    return createSessionHandlerAttached(httpRequest, httpResponse, session)
  }
  if (session.status === 'loggedon') {
    return createSessionHandlerLoggedOn(httpRequest, httpResponse, session)
  }
  throw new Error(`invalid session.status`)
}


// /** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, sessionData: esma.Session | undefined) => esma.SessionHandler} */
// function createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) {
//   const sessionStatus = sessionData?.status ?? 'detached'
//   const methods = {
//     /** @type {(bag?: Record<string, unknown>) => void} */
//     attach(bag = {}) {
//       if (sessionStatus !== 'detached') return
//       /** @type {private.Session} */
//       const newSessionData = { status: 'attached', sessionId: randomUUID(), bag, lastActivity: new Date }
//       sessions.set(newSessionData.sessionId, newSessionData)
//       saveSessions()
//       httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}::; HttpOnly; path=/`)
//       Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
//     },
//     /** @type {(username: string, roles: string[], bag?: Record<string, unknown>) => void} */
//     login(username, roles, bag = {}) {
//       if (!username || !Array.isArray(roles)) throw new Error(`bad arguments`)
//       if (sessionStatus === 'loggedon') this.logout()
//       /** @type {private.Session} */
//       const newSessionData = { status: 'loggedon', sessionId: sessionData?.sessionId ?? randomUUID(), username, roles, bag, lastActivity: new Date }
//       sessions.set(newSessionData.sessionId, newSessionData)
//       saveSessions()
//       httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}:${newSessionData.username}; HttpOnly; path=/`)
//       Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
//     },
//     logout() {
//       if (sessionStatus !== 'loggedon') return
//       if (!sessionData) throw new Error(`sessionData should not be undefined here`)
//       sessions.delete(sessionData.sessionId)
//       saveSessions()
//       httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
//       Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
//     },
//     detach() {
//       if (sessionStatus === 'detached') return
//       if (!sessionData) throw new Error(`sessionData should not be undefined here`)
//       sessions.delete(sessionData.sessionId)
//       saveSessions()
//       httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
//       Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
//     },
//   }
//   if (sessionStatus === 'detached') {
//     const { login, logout, attach } = methods
//     return { status: sessionStatus, login, logout, attach }
//   }
//   if (!sessionData) throw new Error(`sessionData should not be undefined here`)
//   sessionData.lastActivity = new Date
//   if (sessionStatus === 'attached') {
//     const { login, logout, detach } = methods
//     return { ...sessionData, login, logout, detach }
//   } 
//   if (sessionStatus === 'loggedon') {
//     const { login, logout, detach } = methods
//     return { ...sessionData, login, logout, detach }
//   }
//   throw new Error(`invalid session.status: "${sessionStatus}"`)
// }




/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.SessionHandlerDetached} */
function createSessionHandlerDetached(httpRequest, httpResponse) {
  const { attach, login, logout } = sessionHandlerMethods(httpRequest, httpResponse)
  return { status: 'detached', login, logout, attach }
}

/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, session: types.SessionAttached) => esma.SessionHandlerAttached} */
function createSessionHandlerAttached(httpRequest, httpResponse, session) {
  const { detach, login, logout } = sessionHandlerMethods(httpRequest, httpResponse)
  return { status: 'attached', sessionId: session.sessionId, bag: session.bag, detach, login, logout }
}

/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, session: types.SessionLoggedOn) => esma.SessionHandlerLoggenOn} */
function createSessionHandlerLoggedOn(httpRequest, httpResponse, session) {
  const { detach, login, logout } = sessionHandlerMethods(httpRequest, httpResponse)
  return { 
    status: 'loggedon', sessionId: session.sessionId, bag: session.bag, detach, login, logout, 
    username: session.username, roles: session.roles
   }
}


/**
 * @param {http.IncomingMessage} httpRequest
 * @param {http.ServerResponse<http.IncomingMessage>} httpResponse
 * @param {types.Session} [session]
 */
function sessionHandlerMethods(httpRequest, httpResponse, session) {
  return {

    /** @type {(bag?: Record<string, unknown>) => void} */
    attach(bag = {}) {
      /** @type {types.SessionAttached} */
      const newSession = { status: 'attached', sessionId: randomUUID(), bag, lastActivity: new Date }
      sessions.set(newSession.sessionId, newSession)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSession.sessionId}::; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionHandlerAttached(httpRequest, httpResponse, newSession) })
      saveSessions()
    },

    detach() {
      if (!session) throw new Error(`session data should not be undefined here`)
      sessions.delete(session.sessionId)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionHandlerDetached(httpRequest, httpResponse) })
      saveSessions()
    },

    /** @type {(username: string, roles: string[], bag?: Record<string, unknown>) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) throw new Error(`bad arguments`)
      if (session?.status === 'loggedon') this.logout()
      /** @type {types.SessionLoggedOn} */
      const newSession = { status: 'loggedon', sessionId: session?.sessionId ?? randomUUID(), username, roles, bag, lastActivity: new Date }
      sessions.set(newSession.sessionId, newSession)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSession.sessionId}:${newSession.username}; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionHandlerLoggedOn(httpRequest, httpResponse, newSession) })
      saveSessions()
    },

    logout() {
      if (!session) throw new Error(`sessionData should not be undefined here`)
      if (session.status !== 'loggedon') return
      const { status, username, roles, ...attachedSession } = session
      /** @type {types.SessionAttached} */
      const newSession = { status: 'attached', ...attachedSession }
      Object.assign(httpRequest, { session: createSessionHandlerAttached(httpRequest, httpResponse, newSession) })
      saveSessions()
    },

  }
}




/** check if session cookie exists and if it is, retrieve sessionId
 * @type {(req: http.IncomingMessage) => string | undefined} */
function getSessionIdFromSessionCookie(httpRequest) {
  if (!httpRequest.headers['cookie']) return 
  const cookies = httpRequest.headers['cookie'].split(';').map(o => o.trim().split('='))
  for (const [cookieName, cookieValue] of cookies) {
    if (cookieName === settings.sessionCookieName) {
      const sessionId = cookieValue.split(':')[0]
      return sessionId
    }
  }
}


if (process.env.NODE_ENV === 'production') {
  const cleanUpInterval = setInterval(() => {
    const someSessionsExpired = clearExpiredSessions()
    if (someSessionsExpired) saveSessions()
  }, SESSION_TTL)
  process.on('exit', () => clearInterval(cleanUpInterval))
}


async function activatePersistence() {
  await fs.mkdir(`${os.tmpdir()}/esma/sessions`, { recursive: true })
  persistenceFilename = `${os.tmpdir()}/esma/sessions/${process.cwd().replaceAll('/', '_').substring(1)}.json`
  try {
    await fs.stat(persistenceFilename) // check if sessions file exists
  } catch (error) {
    return
  }
  const raw = await fs.readFile(persistenceFilename, 'utf8')
  /** @type {[k: string, v: types.Session][]} */
  const sessionItems = JSON.parse(raw)
  sessionItems.forEach(([k,v]) => sessions.set(k, v))
  const someSessionsExpired = clearExpiredSessions()
  if (someSessionsExpired) saveSessions()
}

/** @type {NodeJS.Timeout} */
let saveSessionsTimeout
function saveSessions() {
  if (!persistenceFilename) return
  // throttle 10 secs
  if (Date.now() - saveSessionsLastCall < 10_000) {
    if (saveSessionsTimeout) return
    saveSessionsTimeout = setTimeout(() => {
      if (saveSessionsTimeout) clearTimeout(saveSessionsTimeout)
      saveSessions()
    }, 10_000 - (Date.now() - saveSessionsLastCall))
    return
  }
  saveSessionsLastCall = Date.now()
  clearExpiredSessions()
  fs.writeFile(persistenceFilename, JSON.stringify([...sessions]))
}

function clearExpiredSessions() {
  // clear sessions that are inactive for more than 1 day
  let changesMade = false
  const now = Date.now()
  for (const [sessionId, sessionData] of sessions) {
    if (now - new Date(sessionData.lastActivity).getTime() > SESSION_TTL) {
      sessions.delete(sessionId)
      changesMade = true
    }
  }
  return changesMade
}