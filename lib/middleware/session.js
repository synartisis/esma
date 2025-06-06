/** @import * as http from 'node:http' */
/** @import * as esma from 'esma' */
import { randomUUID } from 'crypto'
import { settings } from '../esma-settings.js'


/** @type {Map<string, esma.SessionData>} */
export const sessions = new Map


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
      const newSessionData = { status: 'attached', sessionId: randomUUID(), bag }
      sessions.set(newSessionData.sessionId, newSessionData)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}::; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
    },
    /** @type {(username: string, roles: string[], bag?: Record<string, unknown>) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) throw new Error(`bad arguments`)
      if (sessionStatus === 'loggedon') this.logout()
      /** @type {esma.SessionData} */
      const newSessionData = { status: 'loggedon', sessionId: sessionData?.sessionId ?? randomUUID(), username, roles, bag }
      sessions.set(newSessionData.sessionId, newSessionData)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${newSessionData.sessionId}:${newSessionData.username}; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, newSessionData) })
    },
    logout() {
      if (sessionStatus !== 'loggedon') return
      if (!sessionData) throw new Error(`sessionData should not be undefined here`)
      sessions.delete(sessionData.sessionId)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
    },
    detach() {
      if (sessionStatus === 'detached') return
      if (!sessionData) throw new Error(`sessionData should not be undefined here`)
      sessions.delete(sessionData.sessionId)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; HttpOnly; path=/`)
      Object.assign(httpRequest, { session: createSessionObjectFromSessionData(httpRequest, httpResponse, sessionData) })
    },
  }
  if (sessionStatus === 'detached') {
    const { login, logout, attach } = methods
    return { status: sessionStatus, login, logout, attach }
  }
  if (!sessionData) throw new Error(`sessionData should not be undefined here`)
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
