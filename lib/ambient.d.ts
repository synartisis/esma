import type * as types from './esma.d.ts'


declare global {

  namespace esma {
    // type HttpMethods = types.HttpMethods

    // type Request = types.Request
    // type Response = types.Response
    // type Session = types.Session
    // type SessionData = types.SessionData
    // type StaticOptions = types.StaticOptions
    // type StaticFileHandler = types.StaticFileHandler

    // type Handler = types.Handler
    // type ErrorHandler = types.ErrorHandler
    // type HandlerResult = types.HandlerResult

  }  

    type Context = {
      settings: types.Settings
      express_action: string | null
      express_result: any
    }
      

}  

