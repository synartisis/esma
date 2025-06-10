/** @import * as http from 'node:http' */
/** @import * as esma from 'esma' */
import { randomUUID } from 'crypto'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import { settings } from '../esma-settings.js'

const SESSION_TTL = 1000 * 60 * 60   // one hour
const IS_PERSISTENT = true
let persistenceFilename = ''
let saveSessionsLastCall = Date.now()

/** @type {Map<string, esma.SessionData>} */
export const sessions = new Map

if (IS_PERSISTENT) await activatePersistence()

/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.Session} */
export function createSessionObject(httpRequest, httpResponse) {
  // check if session cookie already exists and get sessionData
  const sessionId = getSessionIdFromSessionCookie(httpRequest)
  const sessionData = sessionId ? sessions.get(sessionId) : undefined
  const session = createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData)
  if (!sessionData && session.status !== 'detached') session.detach()
  return session
}


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, sessionData: esma.SessionData | undefined) => esma.Session} */
function createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) {
  const sessionStatus = sessionData?.status ?? 'detached'
  const methods = {
    /** @type {(bag?: Record<string, unknown>) => void} */
    attach(bag = {}) {
      if (sessionStatus !== 'detached') return
      /** @type {esma.SessionData} */
      const newSessionData = { status: 'attached', sessionId: randomUUID(), bag, lastActivity: new Date }
      sessions.set(newSessionData.sessionId, newSessionData)
      saveSessions()
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}::; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
    },
    /** @type {(username: string, roles: string[], bag?: Record<string, unknown>) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) throw new Error(`bad arguments`)
      if (sessionStatus === 'loggedon') this.logout()
      /** @type {esma.SessionData} */
      const newSessionData = { status: 'loggedon', sessionId: sessionData?.sessionId ?? randomUUID(), username, roles, bag, lastActivity: new Date }
      sessions.set(newSessionData.sessionId, newSessionData)
      saveSessions()
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}:${newSessionData.username}; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
    },
    logout() {
      if (sessionStatus !== 'loggedon') return
      if (!sessionData) throw new Error(`sessionData should not be undefined here`)
      sessions.delete(sessionData.sessionId)
      saveSessions()
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
    },
    detach() {
      if (sessionStatus === 'detached') return
      if (!sessionData) throw new Error(`sessionData should not be undefined here`)
      sessions.delete(sessionData.sessionId)
      saveSessions()
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
    },
  }
  if (sessionStatus === 'detached') {
    const { login, logout, attach } = methods
    return { status: sessionStatus, login, logout, attach }
  }
  if (!sessionData) throw new Error(`sessionData should not be undefined here`)
  sessionData.lastActivity = new Date
  if (sessionStatus === 'attached') {
    const { login, logout, detach } = methods
    return { ...sessionData, login, logout, detach }
  } 
  if (sessionStatus === 'loggedon') {
    const { login, logout, detach } = methods
    return { ...sessionData, login, logout, detach }
  }
  throw new Error(`invalid session.status: "${sessionStatus}"`)
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
  /** @type {[k: string, v: esma.SessionData][]} */
  const sessionItems = JSON.parse(raw)
  sessionItems.forEach(([k,v]) => sessions.set(k, v))
  const someSessionsExpired = clearExpiredSessions()
  if (someSessionsExpired) saveSessions()
}

function saveSessions() {
  if (!persistenceFilename) return
  if (Date.now() - saveSessionsLastCall < 10_000) return  // throttle 10 secs
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