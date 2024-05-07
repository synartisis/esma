import type * as http from 'node:http'


/**
 * creates an esma server instance
 * @return {Server}
 * @example const server = esma.createServer()
 * */
export function createServer<TSessionBag>(): Server<TSessionBag>;


/**
 * serve static files
 * @param root the directory to serve
 * @param options serve static options
 * @example server.use(esma.static(__dirname + '../client', { extensions: ['html'] }))
 */
export function static(root: string, options: Partial<StaticOptions>): Handler<any, HandlerResult<HandlerResultValue>>


/**
 * esma router
 * @example 
 * import { router } from 'esma'
 * const r = router()
 * r.get(...)
 */
export function router<TSessionBag>(): Router<TSessionBag>
export { router as Router }


/**
 * configures esma
 * @param userSettings configuration settings
 * @example esma.config({ env: 'production', etag: 'weak', bodyParserLimit: 10_000 })
 */
export function config(userSettings: Partial<Settings>): void


/**
 * esma multilingual functionality
 * @param languages supported languages
 * @example server.use(esma.multilingual(['en', 'fr']))
 */
export function multilingual(languages: string[]): Handler<any, HandlerResult<HandlerResultValue>>


/**
 * esma authorization
 * @param allowedRoles user must have at least one of these roles to be authorized
 * @example server.use(esma.authorize(['admin']))
 */
export function authorize(allowedRoles: string[]): Handler<any, HandlerResult<HandlerResultValue>>




export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'trace' | 'patch'

export type Server<TSessionBag> = http.Server & Router<TSessionBag>

export type Router<TSessionBag> = {
  use: (pathOrHandler: string | Handler<TSessionBag, HandlerResult<HandlerResultValue>>, ...handlers: Handler<TSessionBag, HandlerResult<HandlerResultValue>>[]) => void
  onerror(handler: ErrorHandler): void
} & {
  [method in HttpMethods | 'all']: (pathOrHandler: string | Handler<TSessionBag, HandlerResult<HandlerResultValue>>, ...handlers: Handler<TSessionBag, HandlerResult<HandlerResultValue>>[]) => void
}

export type Request<TSessionBag = unknown, TView = Record<string, unknown>> = http.IncomingMessage & {
  originalUrl: string
  url: string
  baseUrl: string
  params: Record<string, string | undefined>
  query: Record<string, string | undefined>
  body: any
  view: TView
  bag: Record<string, any>
  session: Session<TSessionBag>
}

export type Response<TView = Record<string, unknown>> = http.ServerResponse & {
  writableEnded: boolean
  locals: any
  view: TView
  bag: Record<string, any>
  send: (body: any) => void
  redirect: (loc: string) => void
}

export type FunctionHandler<TSessionBag, TResult extends HandlerResult<HandlerResultValue>> = (req: Request<TSessionBag>, res: Response, next?: Function) => HandlerResult<TResult>
export type ErrorHandler = (err: Error, req: Request<unknown>, res: Response, next?: Function) => unknown
export type Handler<TSessionBag, TResult extends HandlerResult<HandlerResultValue>> = FunctionHandler<TSessionBag, TResult> | Router<TSessionBag>
export type HandlerResult<TResult extends HandlerResultValue> = HandlerResultHttpObject<TResult> | TResult
export type HandlerResultHttpObject<TResult extends HandlerResultValue> = {
  $statusCode?: number
  $headers?: Record<string, string>
  $body: TResult
}
export type HandlerResultValue = string | number | Date | object | void //| Record<string, unknown> | Record<string, unknown>[] | number[] | Buffer | null | void// | unknown

export type Session<TSessionBag> = {
  readonly isLoggedOn: true
  login(username: string, roles: string[], bag?: TSessionBag): void
  logout(): void
} & SessionData<TSessionBag> | {
  readonly isLoggedOn: false
  login(username: string, roles: string[], bag?: TSessionBag): void
  logout(): void
}

// export type Session<TSessionBag> = {
//   readonly isLoggedOn: true
//   logout(): void
// } & SessionData<TSessionBag> | {
//   readonly isLoggedOn: false
//   login(username: string, roles: string[], bag?: TSessionBag): void
// }

export type SessionData<TSessionBag> = {
  sessionId: string
  username: string
  roles: string[]
  bag: TSessionBag
}

export type StaticOptions = {
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

export type StaticFileHandler = (html: string, filename: string, context: unknown) => Promise<string>


export type Settings = {
  /** runtime environment: e.x. 'development', 'production' etc */
  env: 'dev' | string
  /** ETag HTTP response header validator mode: 'weak' | 'strong' */
  etag: 'weak' | 'strong'
  /** default limit to the request body size in bytes */
  bodyParserLimit: number
  /** cookie name used for esma session */
  sessionCookieName: string
  /** automaticaly redirect 401 errors */
  authorizationUrl: string
}
