/// <reference types="node" resolution-mode="require"/>
export function patchRequest(httpRequest: http.IncomingMessage, ctx: import("../types.js").esma.Context): import("../types.js").esma.Request;
export function patchResponse(httpResponse: http.ServerResponse, ctx: esma.Context): esma.Response;
export function createNext(ctx: esma.Context): (kind: any) => any;
export namespace esma {
    type Request = import('../types.js').esma.Request;
    type Response = import('../types.js').esma.Response;
    type Context = import('../types.js').esma.Context;
}
import * as http from 'node:http';
