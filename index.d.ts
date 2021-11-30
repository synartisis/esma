import type * as http from 'http'

declare const _default: {
  createServer: () => esma.Server
  static: (root: string, options?: {
    index: string;
    extensions: string[];
    redirect: boolean;
  }) => esma.Handler
}
export default _default

export const router: () => esma.Router
export const Router: () => esma.Router



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
    }

    type Middleware = {
      path: string
      method: string
      handlers: Handler[]
      router: Router
      urlPattern: any
      applyHandlers(req: Request, res: Response): Promise<void | object>
    }

    type FunctionHandler = (req: Request, res: Response, next?: Function) => Promise<object> | void
    type Handler = Router | FunctionHandler


    type Router = {
      type: string
      mountpath: string
      middleware: Middleware[]
      use(path?: string | Handler, ...handlers: Handler[]): void
      handleRequest(req: Request, res: Response): Promise<void | object>
      // setHttpMethodHandler(method: string): void
      get(path?: string | Handler, ...handlers: Handler[]): void
      post(path?: string | Handler, ...handlers: Handler[]): void
      put(path?: string | Handler, ...handlers: Handler[]): void
      delete(path?: string | Handler, ...handlers: Handler[]): void
      head(path?: string | Handler, ...handlers: Handler[]): void
      options(path?: string | Handler, ...handlers: Handler[]): void
      trace(path?: string | Handler, ...handlers: Handler[]): void
      patch(path?: string | Handler, ...handlers: Handler[]): void
      all(path?: string | Handler, ...handlers: Handler[]): void
      METHOD(method: string, path?: string | Handler, handlers: Handler[]): void
      toJSON(): object
    }

    type Server = http.Server & Router

  }


  declare module http {
    export * from 'http'
    import * as nodeHttp from 'http'
    export class IncomingMessage extends nodeHttp.IncomingMessage { url: string }
    export type RequestListener = (req: IncomingMessage, res: nodeHttp.ServerResponse) => void;
    // export function createServer(requestListener?: RequestListener): Server;
    // export function createServer(options: ServerOptions, requestListener?: RequestListener): Server;
  }

}
