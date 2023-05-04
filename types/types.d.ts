import type * as http from 'node:http'

type Methods = 'get' | 'post' | 'put' | 'delete' |
  'head' | 'options' | 'trace' | 'patch' | 'all'

export namespace esma {

  class Request extends http.IncomingMessage {
    originalUrl: string
    url: string
    baseUrl: string
    params: Record<string, string | undefined>
    query: Record<string, string | undefined>
    _body?: any
    body: Promise<any>
    session: any
  }

  type Response = http.ServerResponse & {
    writableEnded: boolean
    locals: any
    send: (body: any) => void
    redirect: (loc: string) => void
  }

  type MiddlewareResultObject = {
    $statusCode?: number
    $headers?: Record<string, string>
    $body?: any
    $error?: any
    [key: string]: any
  }

  type Server = http.Server & Router

  type Middleware = {
    path: string
    method: string
    handlers: Array<Handler | Promise<Handler>>
    router: Router
    urlPattern: any
    applyHandlers(req: Request, res: Response, ctx: any): Promise<void | object>
  }

  type FunctionHandler = (req: Request, res: Response, next?: Function) => MiddlewareResultObject | void | string | Promise<MiddlewareResultObject | void | string>
  type ErrorHandler = (err: Error, req: Request, res: Response, next?: Function) => ReturnType<MiddlewareSignature>
  type Handler = Router | FunctionHandler

  type StaticFileHandler = (html: string, filename: string, context: unknown) => Promise<string>

  type MiddlewareSignature = (path: string | Handler, ...handlers: Array<Handler>) => MiddlewareResultObject | void | string | Promise<MiddlewareResultObject | void | string>

  type Router = {
    type: 'router'
    mountpath: string
    middleware: Middleware[]
    use: MiddlewareSignature
    // use(...handlers: Array<Handler | Promise<Handler>>): void
    handleRequest(req: Request, res: Response, ctx: unknown): Promise<unknown>
    // get(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // post(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // put(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // delete(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // head(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // options(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // trace(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // patch(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    // all(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
    _method(method: string, path: string | Handler, handlers: Array<Handler>): void
    onerror(handler: ErrorHandler): void
    toJSON(): object
  } & {
    [method in Methods]: MiddlewareSignature
  }

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

  type StaticOptions = {
    dotfiles: 'deny' | 'ignore',
    etag: boolean,
    extensions: string[],
    index: string,
    lastModified: boolean,
    maxAge: number,
    redirect: boolean,
    cacheBusting: boolean,
    parsers: Record<string, StaticFileHandler | StaticFileHandler[]>,
  }
 
}

//   type Router = {
//     type: 'router'
//     mountpath: string
//     middleware: Middleware[]
//     use: Middleware
//     handleRequest(req: Request, res: Response, ctx: any): Promise<void | object>
//     // get(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // post(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // put(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // delete(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // head(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // options(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // trace(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // patch(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // all(path: string | Handler, ...handlers: Array<Handler | Promise<Handler>>): void
//     // private METHOD(method: string, path: string | Handler, handlers: Array<Handler | Promise<Handler>>): void
//     onerror(handler: ErrorHandler): void
//     toJSON(): object
//   } & {
//     [method in Methods]: Middleware
//   }

  
// type Server = http.Server & Router


// type Settings = {
//   env: string
//   etag: 'weak' | 'strong'
//   bodyParserLimit: number
// }


// // type StaticFileHandler = (html: string, filename: string, context: {}) => string

// type StaticOptions = {
//   dotfiles: string,
//   etag: boolean,
//   extensions: string[],
//   index: string,
//   lastModified: boolean,
//   maxAge: number,
//   redirect: boolean,
// }


// // type Middleware = {
// //   path: string
// //   method: string
// //   handlers: Array<Handler | Promise<Handler>>
// //   router: Router
// //   urlPattern: any
// //   applyHandlers(req: Request, res: Response, ctx: any): Promise<void | object>
// // }

// type Context = {
//   settings: Settings
//   express_action: string | null
//   express_result: any
//   }

// type File = {
//   url: string
//   fname: string
// }
