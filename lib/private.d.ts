import type * as public from './types.d.ts'


type RouterObject = public.Router & {
  type: 'router'
  mountpath: string
  middleware: MiddlewareEntry[]
  handleRequest(req: public.Request, res: public.Response, ctx: unknown): Promise<unknown>
  _method(method: string, path: string | public.Middleware | public.Router, handlers: Array<public.Middleware | RouterObject>): void
  toJSON(): object
}

type MiddlewareEntry = {
  path: string
  method: string
  handlers: Array<public.Middleware | Promise<public.Middleware> | RouterObject>
  router: RouterObject
  urlPattern: any
  applyHandlers(req: public.Request, res: public.Response, ctx: any): Promise<void | object>
}

type Context = {
  settings: public.Settings
  express_action: string | null
  express_result: any
  }

type File = {
  url: string
  fname: string
}