import type * as http from 'node:http'
import type * as types from './types.d.ts'


declare global {

  namespace esma {
    type HttpMethods = types.HttpMethods

    type Request<TSessionBag = unknown> = types.Request<TSessionBag>
    type Response = types.Response
    // type HandlerResult<TResult> = priv.HandlerResult<TResult>
    type Session<TSessionBag> = types.Session<TSessionBag>
    type SessionData<TSessionBag> = types.SessionData<TSessionBag>
    type StaticOptions = types.StaticOptions
    type StaticFileHandler = types.StaticFileHandler

    type FunctionHandler<TSessionBag = unknown> = types.FunctionHandler<TSessionBag, any>
    type ErrorHandler = types.ErrorHandler
    type Handler<TSessionBag = unknown> = FunctionHandler<TSessionBag> | RouterObject
    type HandlerResult = types.HandlerResult<types.HandlerResultValue>


    // type FunctionHandler<TSessionBag> = (req: Request<TSessionBag>, res: Response, next?: Function) => HandlerResult
    // type ErrorHandler = (err: Error, req: Request<unknown>, res: Response, next?: Function) => unknown
    // type Handler<TSessionBag = unknown> = FunctionHandler<TSessionBag> | RouterObject

    // type HandlerResult<TResult extends HandlerResultValue = unknown> = {
    //   $statusCode?: number
    //   $headers?: Record<string, string>
    //   $body: TResult
    // } | TResult
    // type HandlerResultValue = string | number | Date | Record<string, unknown> | Record<string, unknown>[] | number[] | Buffer | null | void | unknown

    type Context = {
      settings: types.Settings
      express_action: string | null
      express_result: any
    }
    
    type RouterObject = {
      mountpath: string
      use: (pathOrHandler: string | Handler, ...handlers: Handler[]) => void
      _method(method: HttpMethods, path: string, handlers: Handler[]): void
      onerror(handler: ErrorHandler): void
    } & {
      [method in HttpMethods]: (path: string, ...handlers: Handler[]) => void
    }
    
    type MiddlewareEntry = {
      path: string
      method: string
      handlers: Handler[]
      router: RouterObject
      urlPattern: any
      applyHandlers(req: Request<unknown>, res: Response, ctx: Context): Promise<void | object>
    }
    
    type File = {
      url: string
      fname: string
    }


    
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

