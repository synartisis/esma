import type http from 'http'

declare const _default: {
  createServer: () => EsmaServer
  static: (root: string, options?: object) => Handler
}
export default _default

export const router: () => Router
export const Router: () => Router



declare global {
  
  type EsmaRequest = http.IncomingMessage & {
    originalUrl: string
    url: string
    baseUrl: string
  }

  type EsmaResponse = http.ServerResponse & {
    writableEnded: boolean
  }

  type Middleware = {
    path: string
    method: string
    handlers: Handler[]
    router: Router
    urlPattern: any
    applyHandlers(req: EsmaRequest, res: EsmaResponse): Promise<void | object>
  }

  type Handler = Router | ((req: EsmaRequest, res: EsmaResponse, next?: Function) => Promise<object> | void)

  type EsmaServer = http.Server & Router

  type Router = {
    type: string
    mountpath: string
    middleware: Middleware[]
    use(path?: string | Handler, ...handlers: Handler[]): void
    handleRequest(req: EsmaRequest, res: EsmaResponse): Promise<void | object>
    setHttpMethodHandler(method: string): void
    toJSON(): object
  }

}
