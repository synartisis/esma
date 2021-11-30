import type http from 'http'

declare const _default: {
  createServer: () => esma.Server
  static: (root: string, options?: object) => esma.Handler
}
export default _default

export const router: () => esma.Router
export const Router: () => esma.Router



declare global {
  
  namespace esma {

    type Request = http.IncomingMessage & {
      originalUrl: string
      url: string
      baseUrl: string
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

    type Handler = Router | ((req: Request, res: Response, next?: Function) => Promise<object> | void)


    type Router = {
      type: string
      mountpath: string
      middleware: Middleware[]
      use(path?: string | Handler, ...handlers: Handler[]): void
      handleRequest(req: Request, res: Response): Promise<void | object>
      setHttpMethodHandler(method: string): void
      toJSON(): object
    }

    type Server = http.Server & Router

  }

}
