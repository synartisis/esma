export function serveStatic(root: string, options?: Partial<esma.StaticOptions>): esma.FunctionHandler;
export namespace esma {
    type Request = import('../types.js').esma.Request;
    type Response = import('../types.js').esma.Response;
    type FunctionHandler = import('../types.js').esma.FunctionHandler;
    type StaticFileHandler = import('../types.js').esma.StaticFileHandler;
    type StaticOptions = import('../types.js').esma.StaticOptions;
}
