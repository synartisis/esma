import type * as http from 'node:http'


/**
 * creates an esma server instance
 * @return {Server}
 * @example const server = esma.createServer()
 * */
export function createServer(): Server


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
export function router(): Router
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

export { HttpError, httpRedirect } from './utils.js'

export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'trace' | 'patch'

export type Server = http.Server & Router

export type Router = {
  use: (pathOrHandler: string | Handler | Router, ...handlers: Array<Handler | Router>) => void
  onerror(handler: ErrorHandler): void
} & {
  [method in HttpMethods]: (path: string, ...handlers: Handler[]) => void
}

export type Request = http.IncomingMessage & {
  url: string
  originalUrl: string
  params: Record<string, string | undefined>
  query: Record<string, string | undefined>
  body: any
  view: Record<string, unknown>
  bag: Record<string, any>
  session: Session
}

export type Response = http.ServerResponse & {
  locals: Record<string, unknown>
  view: Record<string, unknown>
  bag: Record<string, unknown>
  redirect: (loc: string) => void
}

export type Handler<
  TResult extends HandlerResultValue = HandlerResultValue
  > = (req: Request, res: Response) => HandlerResult<TResult> | Promise<HandlerResult<TResult>>

export type HandlerResult<TResult extends HandlerResultValue = HandlerResultValue> = HandlerResultHttpObject<TResult> | TResult
export type HandlerResultHttpObject<TResult extends HandlerResultValue = HandlerResultValue> = {
  $statusCode: number
  $headers?: Record<string, string>
  $body?: TResult
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


type ExcludeKeys<T, K extends PropertyKey> = { [P in Exclude<keyof T, K>]: T[P] }
