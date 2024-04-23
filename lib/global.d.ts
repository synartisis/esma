import type * as http from 'node:http'
import type * as priv from './types.d.ts'


declare global {

  namespace esma {
  
    type Request<TSessionBag> = priv.Request<TSessionBag>
    type Session<TSessionBag> = priv.Session<TSessionBag>
    type SessionData<TSessionBag> = priv.SessionData<TSessionBag>
    // type Request<TSessionBag> = http.IncomingMessage & {
    //   originalUrl: string
    //   url: string
    //   baseUrl: string
    //   params: Record<string, string | undefined>
    //   query: Record<string, string | undefined>
    //   body: any
    //   session: Session<TSessionBag>
    //   [key: string]: any
    // }
    
    // type Session<TSessionBag> = {
    //   readonly isLoggedOn: true
    //   logout(): void
    // } & SessionData<TSessionBag> | {
    //   readonly isLoggedOn: false
    //   login(username: string, roles: string[], bag?: TSessionBag): void
    // }
    
    // type SessionData<TSessionBag> = {
    //   sessionId: string
    //   username: string
    //   roles: string[]
    //   bag: TSessionBag
    // }
  
  }  

}  

