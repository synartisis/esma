import * as http from 'node:http'
import { randomUUID } from 'crypto'
import { settings } from '../esma-settings.js'


/** @type {esma.SessionData<unknown>[]} */
export const sessions = []


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.Session<unknown>} */
export function attachSession(httpRequest, httpResponse) {
  const sessionId = getSessionIdFromCookie(httpRequest)
  const sessionData = sessionId ? sessions.find(o => o.sessionId === sessionId) : undefined
  return createSessionObject(httpRequest, httpResponse, sessionData)
  // if (!!sessionData && typeof sessionId === 'string') {
  //   return createSessionObjectLoggedOn(httpRequest, httpResponse, sessionId, sessionData)
  // } else {
  //   return createSessionObjectNotLoggedOn(httpRequest, httpResponse)
  // }
}


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, sessionData: esma.SessionData<unknown> | undefined) => esma.Session<unknown>} */
function createSessionObject(httpRequest, httpResponse, sessionData) {
  const sessionId = sessionData?.sessionId
  const methods = {
    logout() {
      if (!sessionId) return
      const sessionIndex = sessions.findIndex(o => o.sessionId === sessionId)
      if (sessionIndex > -1) sessions.splice(sessionIndex, 1)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=; max-age=0; path=/`)
      Object.assign(httpRequest, { session: createSessionObject(httpRequest, httpResponse, sessionData) })
    },
    /** @type {(username: string, roles: string[], bag?: unknown) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) return
      this.logout()
      const sessionData = { sessionId: randomUUID(), username, roles, bag }
      sessions.push(sessionData)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${sessionData.sessionId}; path=/`)
      Object.assign(httpRequest, { session: createSessionObject(httpRequest, httpResponse, sessionData) })
    },
  }
  if (!!sessionId) {
    return {
      isLoggedOn: true,
      ...methods,
      ...sessionData,
    }
  } else {
    return {
      isLoggedOn: false,
      ...methods,
    }
  }
}

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
