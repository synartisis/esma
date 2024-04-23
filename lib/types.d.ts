import type * as http from 'node:http'

export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'trace' | 'patch'

export type Server<TSessionBag> = http.Server & Router<TSessionBag>

export type Router<TSessionBag> = {
  use: (path: string | Middleware<TSessionBag> | Router<TSessionBag>, ...handlers: Array<Middleware<TSessionBag> | Router<TSessionBag>>) => void
  onerror(handler: ErrorHandler): void
  all: (path: string, handler: Middleware<TSessionBag>) => void
} & {
  [method in HttpMethods]: (path: string, ...handlers: Middleware<TSessionBag>[]) => void
    // | (...handlers: Middleware<TSessionBag>[]) => void
}

export type Middleware<TSessionBag> = (req: Request<TSessionBag>, res: Response, next?: Function) => MiddlewareResult | Promise<MiddlewareResult>
export type ErrorHandler = (err: Error, req: Request<unknown>, res: Response, next?: Function) => MiddlewareResult | Promise<MiddlewareResult>

export type MiddlewareResult = {
  $statusCode?: number
  $headers?: Record<string, string>
  $body?: any
  [key: string]: MiddlewareResultValueType
} | MiddlewareResultValueType

type MiddlewareResultValueType = string | number | Date | Record<string, unknown> | Record<string, unknown>[] | number[] | Buffer | null | void

// export type Request<TSessionBag> = esma.Request<TSessionBag>
export type Request<TSessionBag> = http.IncomingMessage & {
  originalUrl: string
  url: string
  baseUrl: string
  params: Record<string, string | undefined>
  query: Record<string, string | undefined>
  body: any
  session: Session<TSessionBag>
  [key: string]: any
}

export type Response = http.ServerResponse & {
  writableEnded: boolean
  locals: any
  send: (body: any) => void
  redirect: (loc: string) => void
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

export type Session<TSessionBag> = {
  readonly isLoggedOn: true
  logout(): void
} & SessionData<TSessionBag> | {
  readonly isLoggedOn: false
  login(username: string, roles: string[], bag?: TSessionBag): void
}

export type SessionData<TSessionBag> = {
  sessionId: string
  username: string
  roles: string[]
  bag: TSessionBag
}

// export type Session<TSessionBag> = esma.Session<TSessionBag>
// export type SessionData<TSessionBag> = esma.SessionData<TSessionBag>
// export type Session<TSessionBag> = {
//   readonly isLoggedOn: true
//   logout(): void
//   // sessionId: string
//   // username: string
//   // roles: string[]
//   // bag: TSessionBag
// } & SessionData<TSessionBag> | {
//   readonly isLoggedOn: false
//   login(username: string, roles: string[], bag?: TSessionBag): void
// }



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
export function static(root: string, options: Partial<StaticOptions>): Middleware<unknown>


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
export function multilingual(languages: string[]): Middleware<unknown>


/**
 * esma authorization
 * @param allowedRoles user must have at least one of these roles to be authorized
 * @example server.use(esma.authorize(['admin']))
 */
export function authorize(allowedRoles: string[]): Middleware<unknown>


/**
 * user login
 * @param username the username
 * @param roles roles assigned to user
 * @param bag custom data to attach to user session
 * @example
 * server.post('/login', (req, res) => {
 *   const { username } = req.body
 *   const roles = getRolesForUser(username)
 *   esma.login(username, roles)(req, res)
 * })
 */
export function login(username: string, roles: string[], bag?: Record<string, string>): Middleware<unknown>


/**
 * logout current user
 * @example server.get('/logout', esma.logout())
 */
export function logout(): Middleware<unknown>