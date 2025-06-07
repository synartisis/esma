import type * as http from 'node:http'


/**
 * creates an esma server instance
 * @return {Server}
 * @example const server = esma.createServer()
 * */
export function createServer<TSessionBag, TView>(): Server<TSessionBag, TView>;


/**
 * serve static files
 * @param root the directory to serve
 * @param options serve static options
 * @example server.use(esma.static(__dirname + '../client', { extensions: ['html'] }))
 */
export function static(root: string, options: Partial<StaticOptions>): Handler


/**
 * esma router
 * @example 
 * import { router } from 'esma'
 * const r = router()
 * r.get(...)
 */
export function router<TSessionBag, TView>(): Router<TSessionBag, TView>
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
export function multilingual(languages: string[]): Handler


/**
 * esma authorization
 * @param allowedRoles user must have at least one of these roles to be authorized
 * @example server.use(esma.authorize(['admin']))
 */
export function authorize(allowedRoles: string[]): Handler

export { HttpError } from './utils.js'

export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'trace' | 'patch'

export type Server<TSessionBag = Record<string, unknown>, TView = Record<string, unknown>> = http.Server & Router<TSessionBag, TView>

export type Router<TSessionBag = Record<string, unknown>, TView = Record<string, unknown>> = {
  use: (pathOrHandler: string | Handler<TSessionBag, TView, HandlerResult<HandlerResultValue>> | Router<TSessionBag, TView>, ...handlers: Array<Handler<TSessionBag, TView, HandlerResult<HandlerResultValue>> | Router<TSessionBag, TView>>) => void
  onerror(handler: ErrorHandler): void
} & {
  [method in HttpMethods]: (path: string, ...handlers: Handler<TSessionBag, TView, HandlerResult<HandlerResultValue>>[]) => void
}

export type Request<TSessionBag = Record<string, unknown>, TView = Record<string, unknown>> = http.IncomingMessage & {
  url: string
  originalUrl: string
  params: Record<string, string | undefined>
  query: Record<string, string | undefined>
  body: any
  view: TView
  bag: Record<string, any>
  session: Session
}

export type Response<TView = Record<string, unknown>> = http.ServerResponse & {
  locals: TView
  view: TView
  bag: Record<string, any>
  redirect: (loc: string) => void
}

export type Handler<
  TSessionBag = Record<string, unknown>,
  TView = Record<string, unknown>,
  TResult extends HandlerResultValue = HandlerResultValue
  > = (req: Request<TSessionBag, TView>, res: Response<TView>) => HandlerResult<TResult> | Promise<HandlerResult<TResult>>

export type HandlerResult<TResult extends HandlerResultValue = HandlerResultValue> = HandlerResultHttpObject<TResult> | TResult
export type HandlerResultHttpObject<TResult extends HandlerResultValue> = {
  $statusCode?: number
  $headers?: Record<string, string>
  $body: TResult
  $action?: 'skip-router'
}
export type HandlerResultValue = string | string[] | number | number[] | Date | Buffer | Record<string, unknown> | Record<string, unknown>[] | null | void

export type ErrorHandler = (req: Request, res: Response, err: Error) => unknown


export type Session = {
  login(username: string, roles: string[], bag?: Record<string, unknown>): void
  logout(): void
} & (SessionDetached | SessionAttached | SessionLoggenOn)
export type SessionDetached = {
  status: 'detached'
  attach(bag?: Record<string, unknown>): void
}
export type SessionAttached = {
  status: 'attached'
  sessionId: string
  bag: Record<string, unknown>
  lastActivity: Date
  detach(): void
}
export type SessionLoggenOn = Omit<SessionAttached, 'status'> & {
  status: 'loggedon'
  username: string
  roles: string[]
}
export type SessionData = Omit<SessionAttached, 'detach'> | Omit<SessionLoggenOn, 'detach'>


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
