import type http from 'http'



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
    applyHandlers(req: EsmaRequest, res: EsmaResponse): Promise<object>
  }



  type Handler = Router | ((req: EsmaRequest, res: EsmaResponse, next?: Function) => Promise<object>)

  
  type Server = http.Server & Router

  type Router = {
    type: string
    mountpath: string
    middleware: Middleware[]
    use(path: string | Handler, ...handlers: Handler[]): void
    handleRequest(req: EsmaRequest, res: EsmaResponse): Promise<object>
    setHttpMethodHandler(method: string): void
    toJSON(): object
  }
      
}

