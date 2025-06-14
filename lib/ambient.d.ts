import type * as esma from './esma.d.ts'


declare global {

  namespace types {

    type Context = {
      settings: esma.Settings
      skippedRouters: import('./handlers/router.js').RouterObject[]
    }

    type SessionAttached = {
      status: 'attached'
      sessionId: string
      bag: Record<string, unknown>
      lastActivity: Date
    }
  
    type SessionLoggedOn = Omit<SessionAttached, 'status'> & {
      status: 'loggedon'
      username: string
      roles: string[]
    }

    type Session = SessionAttached | SessionLoggedOn

  }


}

