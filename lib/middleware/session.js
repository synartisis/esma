/** @import * as http from 'node:http' */
/** @import * as esma from 'esma' */
import { randomUUID } from 'crypto'
import { settings } from '../esma-settings.js'


/** @type {esma.SessionData[]} */
export const sessions = []


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse) => esma.Session} */
export function attachSession(httpRequest, httpResponse) {
  const sessionId = getSessionIdFromCookie(httpRequest)
  const sessionData = sessionId ? sessions.find(o => o.sessionId === sessionId) : undefined
  return createSessionObject(httpRequest, httpResponse, sessionData)
}


/** @type {(httpRequest: http.IncomingMessage, httpResponse: http.ServerResponse, sessionData: esma.SessionData | undefined) => esma.Session} */
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
    /** @type {(username: string, roles: string[], bag?: any) => void} */
    login(username, roles, bag = {}) {
      if (!username || !Array.isArray(roles)) return
      this.logout()
      const sessionData = { sessionId: randomUUID(), username, roles, bag }
      sessions.push(sessionData)
      httpResponse.setHeader('set-cookie', `${settings.sessionCookieName}=${sessionData.sessionId}:${sessionData.username}:${sessionData.roles.join(',')}; path=/`)
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
      const sessionId = cookieValue.split(':')[0]
      return sessionId
    }
  }
}
