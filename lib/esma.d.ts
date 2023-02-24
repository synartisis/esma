import type * as http from 'http'

declare const _default: {
  createServer: () => esma.Server
  static: (root: string, options?: {
    dotfiles: string,
    etag: boolean,
    extensions: string[],
    index: string,
    lastModified: boolean,
    maxAge: number,
    redirect: boolean,
  }) => esma.Handler
  config(userSettings: esma.Settings)
}
export default _default

export function router(): esma.Router
export function Router(): esma.Router

declare global {
  
  namespace esma {

    class Request extends http.IncomingMessage {
      originalUrl: string
      url: string
      baseUrl: string
      params?: object
      query?: object
      _body?: object
      body: Promise<object>
    }

    type Response = http.ServerResponse & {
      writableEnded: boolean
      locals: any
      send: (body: any) => void
      redirect: (loc: string) => void
    }

    type Middleware = {
      path: string
      method: string
      handlers: Handler[]
      router: Router
      urlPattern: any
      applyHandlers(req: Request, res: Response, ctx: any): Promise<void | object>
    }

    type FunctionHandler = (req: Request, res: Response, next?: Function) => Promise<any> | void
    type ErrorHandler = (err: Error, req: Request, res: Response, next?: Function) => Promise<object> | void
    type Handler = Router | FunctionHandler

    type StaticFileHandler = (html: string, filename: string, context: {}) => string


    type Router = {
      type: 'router'
      mountpath: string
      middleware: Middleware[]
      use(path: string, ...handlers: Handler[]): void
      use(...handlers: Handler[]): void
      private handleRequest(req: Request, res: Response, ctx: any): Promise<void | object>
      get(path: string | Handler, ...handlers: Handler[]): void
      post(path: string | Handler, ...handlers: Handler[]): void
      put(path: string | Handler, ...handlers: Handler[]): void
      delete(path: string | Handler, ...handlers: Handler[]): void
      head(path: string | Handler, ...handlers: Handler[]): void
      options(path: string | Handler, ...handlers: Handler[]): void
      trace(path: string | Handler, ...handlers: Handler[]): void
      patch(path: string | Handler, ...handlers: Handler[]): void
      all(path: string | Handler, ...handlers: Handler[]): void
      private METHOD(method: string, path: string | Handler, handlers: Handler[]): void
      onerror(handler: ErrorHandler): void
      toJSON(): object
    }

    type Server = http.Server & Router

    type Settings = {
      env: string
      etag: 'weak' | 'strong'
      bodyParserLimit: number
    }

    type Context = {
      settings: Settings
      express_action: string | null
      express_result: any
      }

    type File = {
      url: string
      fname: string
    }

  }


  declare module http {
    export * from 'http'
  }

}
