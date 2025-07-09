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


/**
 * esma Error object to be thrown inside Handlers
 * @param {keyof typeof httpErrorStatusCodes} statusCode http error status code
 * @param {string} [message] error message, if not defined the standard message for the status code will be included
 * @example
 * server.get('/a-path', req => {
 *   if (missingArgument) throw new esma.HttpError(400, 'an argument is missing')
 * })
 */
export class HttpError extends Error {
  constructor(statusCode: number, message?: string)
  statusCode: number
}


/**
 * redirect helper
 * @param location redirect location url
 * @param statusCode http status code (default 302)
 * @example
 * server.get('/a-path', req => {
 *   return esma.httpRedirect('/')  // back to root
 * })
 */
export function httpRedirect(location: string, statusCode?: keyof [302, 301, 307, 308]): HandlerResultHttpObject


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
  session: SessionHandler
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

export type ErrorHandler = (err: Error, req: Request, res: Response) => string | Promise<string> | void | Promise<void>


export type SessionHandler = SessionHandlerDetached | SessionHandlerAttached | SessionHandlerLoggenOn
export type SessionHandlerDetached = {
  status: 'detached'
  attach(bag?: Record<string, unknown>): void
} & SessionHandlerBase
export type SessionHandlerAttached = {
  status: 'attached'
  sessionId: string
  bag: Record<string, unknown>
  // lastActivity: Date
  detach(): void
} & SessionHandlerBase
export type SessionHandlerLoggenOn = Omit<SessionHandlerAttached, 'status'> & {
  status: 'loggedon'
  username: string
  roles: string[]
}
type SessionHandlerBase = {
  login(username: string, roles: string[], bag?: Record<string, unknown>): void
  logout(): void
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
